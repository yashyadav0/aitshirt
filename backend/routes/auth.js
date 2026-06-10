const express =
  require("express");

const bcrypt =
  require("bcrypt");

const axios =
  require("axios");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

const SALT_ROUNDS =
  12;

const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let firebaseCertCache = {
  expiresAt: 0,
  certs: {}
};

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

function validatePassword(password) {

  return typeof password === "string" &&
    password.length >= 6;
}

async function getFirebaseCerts() {

  if (
    firebaseCertCache.expiresAt > Date.now() &&
    Object.keys(firebaseCertCache.certs).length
  ) {
    return firebaseCertCache.certs;
  }

  const res =
    await axios.get(
      FIREBASE_CERTS_URL
    );

  const cacheControl =
    res.headers["cache-control"] || "";

  const maxAgeMatch =
    cacheControl.match(
      /max-age=(\d+)/
    );

  const maxAgeMs =
    maxAgeMatch
      ? Number(maxAgeMatch[1]) * 1000
      : 60 * 60 * 1000;

  firebaseCertCache = {
    certs: res.data,
    expiresAt:
      Date.now() + maxAgeMs
  };

  return firebaseCertCache.certs;
}

async function verifyFirebasePhoneToken(firebaseIdToken, phone) {

  if (!firebaseIdToken) {
    throw new Error(
      "Firebase verification token required"
    );
  }

  const decodedHeader =
    jwt.decode(
      firebaseIdToken,
      {
        complete: true
      }
    );

  if (!decodedHeader?.header?.kid) {
    throw new Error(
      "Invalid Firebase verification token"
    );
  }

  const certs =
    await getFirebaseCerts();

  const cert =
    certs[decodedHeader.header.kid];

  if (!cert) {
    throw new Error(
      "Unknown Firebase verification token key"
    );
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    "aishirtmaking";

  const decoded =
    jwt.verify(
      firebaseIdToken,
      cert,
      {
        algorithms: [
          "RS256"
        ],
        audience: projectId,
        issuer:
          `https://securetoken.google.com/${projectId}`
      }
    );

  if (decoded.phone_number !== phone) {
    throw new Error(
      "Verified phone number does not match"
    );
  }

  return decoded;
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
      }).select("_id phone name phoneVerified");

    res.json({
      exists: Boolean(user),
      phone,
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

router.post("/register", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    const {
      name,
      password,
      phoneVerified,
      firebaseIdToken
    } = req.body;

    if (!phone || !name || !password) {
      return res.status(400).json({
        error: "Phone, name and password are required"
      });
    }

    if (!phoneVerified) {
      return res.status(400).json({
        error: "Phone number must be verified before registration"
      });
    }

    await verifyFirebasePhoneToken(
      firebaseIdToken,
      phone
    );

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
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

    const passwordHash =
      await bcrypt.hash(
        password,
        SALT_ROUNDS
      );

    const user =
      await User.create({
        phone,
        name: name.trim(),
        passwordHash,
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

    if (
      err.message?.includes("Firebase") ||
      err.message?.includes("Verified phone") ||
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(400).json({
        error: err.message
      });
    }

    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/login", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    const {
      password
    } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        error: "Phone and password are required"
      });
    }

    const user =
      await User.findOne({
        phone
      });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: "Invalid phone number or password"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid phone number or password"
      });
    }

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });

  } catch (err) {

    console.log(
      "LOGIN ERROR:",
      err
    );

    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/forgot-password", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    const {
      password,
      phoneVerified,
      firebaseIdToken
    } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        error: "Phone and new password are required"
      });
    }

    if (!phoneVerified) {
      return res.status(400).json({
        error: "Phone number must be verified before password reset"
      });
    }

    await verifyFirebasePhoneToken(
      firebaseIdToken,
      phone
    );

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

    const user =
      await User.findOne({
        phone
      });

    if (!user) {
      return res.status(404).json({
        error: "No account found for this phone number"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

    user.passwordHash =
      await bcrypt.hash(
        password,
        SALT_ROUNDS
      );

    user.phoneVerified =
      true;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (err) {

    console.log(
      "FORGOT PASSWORD ERROR:",
      err
    );

    if (
      err.message?.includes("Firebase") ||
      err.message?.includes("Verified phone") ||
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(400).json({
        error: err.message
      });
    }

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
