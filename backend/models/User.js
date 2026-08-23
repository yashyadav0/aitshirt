const mongoose =
  require("mongoose");

const { getTierConfig } = require("../config/tiers");

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

    // 🎫 Tier / Subscription
    tier: {
      type: String,
      default: "normal",
      enum: ["normal", "recurring", "vip", "premium"]
    },

    weeklyLimit: {
      type: Number,
      default: 7
    },

    tierAssignedAt: {
      type: Date
    },

    // 🎁 Prompt Credits
    weeklyPromptsLeft: {
      type: Number,
      default: 7
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

// Pre-save: initialize weeklyLimit from tier if not set (new user)
// Modern Mongoose: no `next` callback needed for sync middleware
userSchema.pre("save", function () {
  if (this.isNew && !this.weeklyLimit) {
    this.weeklyLimit = getTierConfig(this.tier).weeklyLimit;
  }
});

module.exports =
  mongoose.model(
    "User",
    userSchema
  );
