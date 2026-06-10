const mongoose =
  require("mongoose");

const presetSchema =
  new mongoose.Schema({

    name: {
      type: String,
      required: true,
      trim: true
    },

    emoji: {
      type: String,
      default: ""
    },

    prompt: {
      type: String,
      required: true
    },

    enabled: {
      type: Boolean,
      default: true
    }

  }, {
    timestamps: true
  });

module.exports =
  mongoose.model(
    "Preset",
    presetSchema
  );
