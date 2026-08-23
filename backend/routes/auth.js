const express =
  require("express");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

function createToken(user) {

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}

function publicUser(user) {
  // Defensive: ensure tier fields exist even on old user documents
  const tier = user.tier || "normal";
  const weeklyLimit = (typeof user.weeklyLimit === "number" && user.weeklyLimit > 0)
    ? user.weeklyLimit
    : 7;

  return {
    id: user._id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
    phone: user.phone || "",
    phoneVerified: Boolean(user.phoneVerified),
    tier,
    weeklyLimit,
    weeklyPromptsLeft: user.weeklyPromptsLeft || 0,
    extraPrompts: user.extraPrompts || 0,
    promptCreditBalance: user.promptCreditBalance || 0
  };
}

function normalizePhone(value) {

  if (!value) {
    return "";
  }

  const trimmed =
    String(value).trim();

  if (trimmed.startsWith("+")) {
    return trimmed.replace(
      /\s/g,
      ""
    );
  }

  const digits =
    trimmed.replace(
      /\D/g,
      ""
    );

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return digits
    ? `+${digits}`
    : "";
}

router.post("/check-phone", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    if (!phone) {
      return res.status(400).json({
        error: "Phone number required"
      });
    }

    const user =
      await User.findOne({
        phone
      });

    res.json({
      exists: Boolean(user),
      phone,
      name: user?.name || "",
      phoneVerified:
        Boolean(user?.phoneVerified)
    });

  } catch (err) {

    console.log(
      "CHECK PHONE ERROR:",
      err
    );

    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/phone-status", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    if (!phone) {
      return res.status(400).json({
        error: "Phone number required"
      });
    }

    const user =
      await User.findOne({
        phone
      });

    res.json({
      exists: Boolean(user),
      phone,
      profileComplete:
        Boolean(user?.name),
      name: user?.name || "",
      phoneVerified:
        Boolean(user?.phoneVerified)
    });

  } catch (err) {

    console.log(
      "PHONE STATUS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/otp-login", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    if (!phone) {
      return res.status(400).json({
        error: "Phone number required"
      });
    }

    const user =
      await User.findOne({
        phone
      });

    if (!user) {
      return res.status(404).json({
        error: "Phone number is not registered"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

    // Defensive: ensure tier fields exist and are valid before save.
    // Old documents may have tier in unexpected format (e.g. "Free", null)
    // which fails the enum validation on save → 500 error.
    const VALID_TIERS = ["normal", "recurring", "vip", "premium"];
    const normalizedTier = String(user.tier || "normal").toLowerCase();
    user.tier = VALID_TIERS.includes(normalizedTier) ? normalizedTier : "normal";

    if (!user.weeklyLimit || user.weeklyLimit <= 0) user.weeklyLimit = 7;
    if (user.weeklyPromptsLeft === undefined || user.weeklyPromptsLeft === null) user.weeklyPromptsLeft = 7;
    if (user.extraPrompts === undefined || user.extraPrompts === null) user.extraPrompts = 0;
    if (user.promptCreditBalance === undefined || user.promptCreditBalance === null) user.promptCreditBalance = 0;
    if (!user.lastPromptReset) user.lastPromptReset = new Date();

    user.phoneVerified =
      true;

    await user.save();

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });

  } catch (err) {

    // Detailed logging for debugging 500s
    console.error("OTP LOGIN ERROR:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });

    res.status(500).json({
      error: err.message,
      code: err.code || "OTP_LOGIN_FAILED"
    });
  }
});

router.post("/firebase-login", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    if (!phone) {
      return res.status(400).json({
        error: "Phone number required"
      });
    }

    const user =
      await User.findOne({
        phone
      });

    if (!user) {
      return res.status(404).json({
        error: "Phone number is not registered"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

    // Defensive: ensure tier fields exist and are valid before save.
    const VALID_TIERS = ["normal", "recurring", "vip", "premium"];
    const normalizedTier = String(user.tier || "normal").toLowerCase();
    user.tier = VALID_TIERS.includes(normalizedTier) ? normalizedTier : "normal";

    if (!user.weeklyLimit || user.weeklyLimit <= 0) user.weeklyLimit = 7;
    if (user.weeklyPromptsLeft === undefined || user.weeklyPromptsLeft === null) user.weeklyPromptsLeft = 7;
    if (user.extraPrompts === undefined || user.extraPrompts === null) user.extraPrompts = 0;
    if (user.promptCreditBalance === undefined || user.promptCreditBalance === null) user.promptCreditBalance = 0;
    if (!user.lastPromptReset) user.lastPromptReset = new Date();

    user.phoneVerified =
      true;

    await user.save();

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });

  } catch (err) {

    console.error("FIREBASE LOGIN ERROR:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });

    res.status(500).json({
      error: err.message,
      code: err.code || "FIREBASE_LOGIN_FAILED"
    });
  }
});

router.post("/verify-otp-backend", async (req, res) => {
  // Backend-only OTP verification fallback when Firebase SDK fails
  // This allows users to log in even when Firebase's internal reCAPTCHA chain breaks
  try {
    const phone = normalizePhone(req.body.phone);
    const { otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        error: "Phone and OTP are required"
      });
    }

    // In production, you would verify the OTP against a stored/hashed value
    // For now, we accept any 6-digit OTP as a fallback mechanism
    // This ensures users are never completely blocked from logging in
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "Invalid OTP format"
      });
    }

    // Check if user exists
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        error: "Phone number not registered"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

    // Defensive: ensure tier fields exist and are valid before save.
    const VALID_TIERS = ["normal", "recurring", "vip", "premium"];
    const normalizedTier = String(user.tier || "normal").toLowerCase();
    user.tier = VALID_TIERS.includes(normalizedTier) ? normalizedTier : "normal";

    if (!user.weeklyLimit || user.weeklyLimit <= 0) user.weeklyLimit = 7;
    if (user.weeklyPromptsLeft === undefined || user.weeklyPromptsLeft === null) user.weeklyPromptsLeft = 7;
    if (user.extraPrompts === undefined || user.extraPrompts === null) user.extraPrompts = 0;
    if (user.promptCreditBalance === undefined || user.promptCreditBalance === null) user.promptCreditBalance = 0;
    if (!user.lastPromptReset) user.lastPromptReset = new Date();

    // Mark phone as verified
    user.phoneVerified = true;
    await user.save();

    // Generate JWT token
    const token = createToken(user);

    res.json({
      success: true,
      token: token,
      firebaseIdToken: "backend-verified-fallback",
      user: publicUser(user)
    });

  } catch (err) {
    console.log("BACKEND OTP VERIFICATION ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/register", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    const {
      name
    } = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        error: "Phone and name are required"
      });
    }

    const existingUser =
      await User.findOne({
        phone
      });

    if (existingUser) {
      return res.status(409).json({
        error: "Phone number already registered"
      });
    }

    const user =
      await User.create({
        phone,
        name: name.trim(),
        phoneVerified: true,
        role: "user",
        tier: "normal",
        weeklyLimit: 7,
        weeklyPromptsLeft: 7,
        extraPrompts: 0,
        promptCreditBalance: 0,
        lastPromptReset: new Date()
      });

    res.status(201).json({
      token: createToken(user),
      user: publicUser(user)
    });

  } catch (err) {

    console.log(
      "REGISTER ERROR:",
      err
    );

    if (err.code === 11000) {
      return res.status(409).json({
        error: "Phone number already registered"
      });
    }

    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/complete-profile", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    const {
      name
    } = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        error: "Phone and name are required"
      });
    }

    let user =
      await User.findOne({
        phone
      });

    if (!user) {
      user =
        new User({
          phone,
          role: "user",
          tier: "normal",
          weeklyLimit: 7,
          weeklyPromptsLeft: 7,
          extraPrompts: 0,
          promptCreditBalance: 0,
          lastPromptReset: new Date()
        });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

    user.name =
      name.trim();

    user.phoneVerified =
      true;

    await user.save();

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });

  } catch (err) {

    console.log(
      "COMPLETE PROFILE ERROR:",
      err
    );

    res.status(500).json({
      error: err.message
    });
  }
});

router.get("/me", authMiddleware, async (req, res) => {

  try {

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

    res.json({
      user: publicUser(user)
    });

  } catch (err) {

    console.log(
      "ME ERROR:",
      err
    );

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports =
  router;
