const express =
  require("express");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

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
    phone: user.phone
  };
}

router.post("/phone-status", async (req, res) => {

  try {

    const { phone } =
      req.body;

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
      profileComplete:
        Boolean(user?.name),
      name: user?.name || ""
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/complete-profile", async (req, res) => {

  try {

    const {
      phone,
      name,
      email
    } = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        error: "Name and phone are required"
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

    user.name = name;
    user.email =
      email || "";

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

router.post("/firebase-login", async (req, res) => {

  try {

    const { phone } =
      req.body;

    if (!phone) {
      return res.status(400).json({
        error: "Phone number required"
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
          weeklyPromptsLeft: 5,
          extraPrompts: 0,
          promptCreditBalance: 0,
          lastPromptReset: new Date(),
          role: "user"
        });

      await user.save();
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: "User is blocked"
      });
    }

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

module.exports =
  router;
