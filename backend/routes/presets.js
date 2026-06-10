const express =
  require("express");

const router =
  express.Router();

const Preset =
  require("../models/Preset");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

router.get("/", async (req, res) => {

  try {

    const presets =
      await Preset.find({
        enabled: true
      }).sort({
        createdAt: 1
      });

    res.json(
      presets
    );

  } catch (err) {

    res.status(500).json({
      error: "Failed to load presets"
    });
  }
});

router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      const presets =
        await Preset.find()
          .sort({
            createdAt: -1
          });

      res.json(
        presets
      );

    } catch (err) {

      res.status(500).json({
        error: "Failed to load presets"
      });
    }
  }
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      const preset =
        await Preset.create(
          req.body
        );

      res.status(201).json(
        preset
      );

    } catch (err) {

      res.status(400).json({
        error: "Failed to create preset"
      });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      const preset =
        await Preset.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true
          }
        );

      res.json(
        preset
      );

    } catch (err) {

      res.status(400).json({
        error: "Failed to update preset"
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      await Preset.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true
      });

    } catch (err) {

      res.status(400).json({
        error: "Failed to delete preset"
      });
    }
  }
);

module.exports =
  router;
