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

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    phoneVerified: user.phoneVerified
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

    user.phoneVerified =
      true;

    await user.save();

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });

  } catch (err) {

    console.log(
      "OTP LOGIN ERROR:",
      err
    );

    res.status(500).json({
      error: err.message
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

    user.phoneVerified =
      true;

    await user.save();

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });

  } catch (err) {

    console.log(
      "FIREBASE LOGIN ERROR:",
      err
    );

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
        weeklyPromptsLeft: 5,
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
          weeklyPromptsLeft: 5,
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
