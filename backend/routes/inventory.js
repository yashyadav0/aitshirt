const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

// =====================================
// 📦 PUBLIC INVENTORY / COLOR AVAILABILITY
// =====================================

// GET available colors for a product type (colors with stock > 0)
// Public endpoint - no auth required
router.get(
  "/colors/:productType",
  async (req, res) => {
    try {
      const { productType } = req.params;

      const products = await Product.find({ category: productType });

      const colorsWithStock = {};

      products.forEach(product => {
        (product.variants || []).forEach(variant => {
          const color = variant.color.toLowerCase();
          const size = variant.size.toUpperCase();
          const stock = variant.stock || 0;

          if (!colorsWithStock[color]) {
            colorsWithStock[color] = {
              totalStock: 0,
              sizes: {}
            };
          }

          colorsWithStock[color].sizes[size] = stock;
          colorsWithStock[color].totalStock += stock;
        });
      });

      // Filter to only colors with stock > 0
      const availableColors = Object.entries(colorsWithStock)
        .filter(([, data]) => data.totalStock > 0)
        .map(([color, data]) => ({
          color,
          ...data
        }));

      res.json({
        success: true,
        productType,
        colors: availableColors
      });
    } catch (err) {
      console.log("FETCH COLORS ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// GET full inventory breakdown for a product type
// Public endpoint - no auth required
router.get(
  "/:productType",
  async (req, res) => {
    try {
      const { productType } = req.params;

      const products = await Product.find({ category: productType });

      const inventory = {};

      products.forEach(product => {
        (product.variants || []).forEach(variant => {
          const color = variant.color.toLowerCase();
          const size = variant.size.toUpperCase();
          const stock = variant.stock || 0;

          if (!inventory[color]) {
            inventory[color] = {
              totalStock: 0,
              sizes: {}
            };
          }

          inventory[color].sizes[size] = stock;
          inventory[color].totalStock += stock;
        });
      });

      res.json({
        success: true,
        productType,
        inventory
      });
    } catch (err) {
      console.log("FETCH INVENTORY ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;