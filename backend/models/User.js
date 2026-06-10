const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema({

    name: {
      type: String,
      default: ""
    },

    email: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    passwordHash: {
      type: String,
      default: ""
    },

    phoneVerified: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      default: "user"
    },

    // 🚫 Block System
    isBlocked: {
      type: Boolean,
      default: false
    },

    // 🎁 Prompt Credits
    weeklyPromptsLeft: {
      type: Number,
      default: 5
    },

    extraPrompts: {
      type: Number,
      default: 0
    },

    promptCreditBalance: {
      type: Number,
      default: 0
    },

    lastPromptReset: {
      type: Date,
      default: Date.now
    }

  }, {
    timestamps: true
  });

module.exports =
  mongoose.model(
    "User",
    userSchema
  );
