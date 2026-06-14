const express =
  require("express");

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

  firebaseCertCache = {
    certs: res.data,
    expiresAt:
      Date.now() +
      (
        maxAgeMatch
          ? Number(maxAgeMatch[1]) * 1000
          : 60 * 60 * 1000
      )
  };

  return firebaseCertCache.certs;
}

async function verifyFirebasePhoneToken(firebaseIdToken, phone) {

  if (!firebaseIdToken) {
    throw new Error(
      "Firebase OTP verification token required"
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
      "Invalid Firebase OTP verification token"
    );
  }

  const certs =
    await getFirebaseCerts();

  const cert =
    certs[decodedHeader.header.kid];

  if (!cert) {
    throw new Error(
      "Unknown Firebase OTP verification token key"
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

function firebaseTokenError(err) {

  return err.message?.includes("Firebase") ||
    err.message?.includes("Verified phone") ||
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError";
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

router.post("/otp-login", async (req, res) => {

  try {

    const phone =
      normalizePhone(
        req.body.phone
      );

    const {
      firebaseIdToken
    } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: "Phone number required"
      });
    }

    await verifyFirebasePhoneToken(
      firebaseIdToken,
      phone
    );

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

    res.status(
      firebaseTokenError(err)
        ? 400
        : 500
    ).json({
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
      firebaseIdToken
    } = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        error: "Phone and name are required"
      });
    }

    await verifyFirebasePhoneToken(
      firebaseIdToken,
      phone
    );

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

    res.status(
      firebaseTokenError(err)
        ? 400
        : 500
    ).json({
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
