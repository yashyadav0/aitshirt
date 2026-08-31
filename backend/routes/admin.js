const express =
  require("express");

const router =
  express.Router();

const User =
  require("../models/User");

const Order =
  require("../models/Order");

const Product =
  require("../models/Product");

const Coupon =
  require("../models/Coupon");

const Generation =
  require("../models/Generation");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const {
  getTierConfig
} = require("../config/tiers");


// =====================================
// 🔧 DEV HELPER: Grant admin to current user (dev/test only)
// =====================================

router.post(
  "/dev/grant-admin",
  authMiddleware,
  async (req, res) => {

    // Only allow in non-production environments
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        error: "Not available in production"
      });
    }

    try {

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      if (user.role === "admin") {
        return res.json({
          success: true,
          message: "User is already an admin",
          user: { id: user._id, role: user.role }
        });
      }

      user.role = "admin";
      user.tier = "vip";
      user.weeklyLimit = 999;
      user.weeklyPromptsLeft = 999;
      await user.save();

      // Return new token with admin role
      const jwt = require("jsonwebtoken");
      const newToken = jwt.sign(
        { id: user._id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: "Admin role granted",
        token: newToken,
        user: { id: user._id, role: "admin" }
      });

    } catch (err) {

      console.log("GRANT ADMIN ERROR:", err);
      res.status(500).json({
        error: err.message
      });
    }
  }
);


// =====================================
// 📊 DASHBOARD
// =====================================

router.get(

  "/dashboard",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      // 📊 Counts

      const totalUsers =
        await User.countDocuments();

      const totalOrders =
        await Order.countDocuments();

      const totalProducts =
        await Product.countDocuments();

      const totalCoupons =
        await Coupon.countDocuments();

      const totalGenerations =
        await Generation.countDocuments();


      // 💰 Revenue

      const paidOrders =
        await Order.find({

          paymentStatus: "paid"
        });


      let totalRevenue = 0;

      paidOrders.forEach(
        (order) => {

          totalRevenue +=
            order.finalAmount || 0;
        }
      );


      // 📈 Revenue Chart

      const revenueChart =
        await Order.aggregate([

          {
            $match: {

              paymentStatus: "paid"
            }
          },

          {
            $group: {

              _id: {

                month: {
                  $month: "$createdAt"
                }
              },

              revenue: {
                $sum: "$finalAmount"
              }
            }
          },

          {
            $sort: {

              "_id.month": 1
            }
          }
        ]);


      const monthNames = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];


      const formattedRevenueChart =

        revenueChart.map(
          (item) => ({

            month:

              monthNames[
                item._id.month - 1
              ],

            revenue:
              item.revenue
          })
        );


      // 📦 Orders Chart

      const orderChart =
        await Order.aggregate([

          {
            $group: {

              _id: {

                day: {
                  $dayOfWeek:
                    "$createdAt"
                }
              },

              orders: {
                $sum: 1
              }
            }
          },

          {
            $sort: {

              "_id.day": 1
            }
          }
        ]);


      const dayNames = [

        "",
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
      ];


      const formattedOrderChart =

        orderChart.map(
          (item) => ({

            day:
              dayNames[
                item._id.day
              ],

            orders:
              item.orders
          })
        );


      // ⚡ Recent Activity

      const recentOrders =
        await Order.find()

          .sort({
            createdAt: -1
          })

          .limit(5);


      const recentActivity =

        recentOrders.map(
          (order) => ({

            title:
              `Order ${order.orderStatus}`,

            payment:
              order.paymentStatus,

            amount:
              order.finalAmount,

            time:
              order.createdAt
          })
        );


      // ✅ Response

      res.json({

        revenue:
          totalRevenue,

        orders:
          totalOrders,

        users:
          totalUsers,

        products:
          totalProducts,

        coupons:
          totalCoupons,

        generations:
          totalGenerations,

        revenueChart:
          formattedRevenueChart,

        orderChart:
          formattedOrderChart,

        recentActivity
      });

    } catch (err) {

      console.log(
        "ADMIN DASHBOARD ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// 👥 GET USERS
// =====================================

router.get(

  "/users",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const users =
        await User.find()

          .sort({
            createdAt: -1
          });


      res.json(users);

    } catch (err) {

      console.log(
        "FETCH USERS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// 🚫 BLOCK / UNBLOCK USER
// =====================================

router.put(

  "/block-user/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );


      if (!user) {

        return res.status(404)
          .json({

            error:
              "User not found"
          });
      }


      // 🔄 Toggle

      user.isBlocked =
        !user.isBlocked;


      await user.save();


      res.json({

        success: true,

        isBlocked:
          user.isBlocked
      });

    } catch (err) {

      console.log(
        "BLOCK USER ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// ✏️ UPDATE USER (tier / credits / role / block)
// =====================================

router.put(

  "/users/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404)
          .json({
            error: "User not found"
          });
      }

      const {
        tier,
        weeklyLimit,
        extraPrompts,
        promptCreditBalance,
        weeklyPromptsLeft,
        isBlocked,
        role
      } = req.body;

      // 🎫 Tier
      if (tier && ["normal", "recurring", "vip"].includes(tier)) {
        user.tier = tier;
        user.tierAssignedAt = new Date();
        // Auto-set weeklyLimit from tier unless explicitly overridden
        if (weeklyLimit === undefined) {
          user.weeklyLimit = getTierConfig(tier).weeklyLimit;
        }
      }

      // 🔢 Explicit weekly limit
      if (weeklyLimit !== undefined) {
        user.weeklyLimit = Number(weeklyLimit) || 0;
      }

      if (extraPrompts !== undefined) {
        user.extraPrompts = Number(extraPrompts) || 0;
      }

      if (promptCreditBalance !== undefined) {
        user.promptCreditBalance = Number(promptCreditBalance) || 0;
      }

      if (weeklyPromptsLeft !== undefined) {
        user.weeklyPromptsLeft = Number(weeklyPromptsLeft) || 0;
      }

      if (typeof isBlocked === "boolean") {
        user.isBlocked = isBlocked;
      }

      if (role && ["user", "admin"].includes(role)) {
        user.role = role;
      }

      await user.save();

      res.json({
        success: true,
        user
      });

    } catch (err) {

      console.log(
        "UPDATE USER ERROR:",
        err
      );

      res.status(500)
        .json({
          error: err.message
        });
    }
  }
);


// =====================================
// 📦 GET ORDERS
// =====================================

router.get(

  "/orders",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const orders =
        await Order.find()

          .sort({
            createdAt: -1
          });


      res.json(orders);

    } catch (err) {

      console.log(
        "FETCH ORDERS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// ✏️ UPDATE ORDER STATUS
// =====================================

router.put(

  "/orders/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const {
        orderStatus
      } = req.body;


      const order =
        await Order.findById(
          req.params.id
        );


      if (!order) {

        return res.status(404)
          .json({

            error:
              "Order not found"
          });
      }


      order.orderStatus =
        orderStatus;


      await order.save();


      res.json({

        success: true,
        order
      });

    } catch (err) {

      console.log(
        "UPDATE ORDER ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);


// =====================================
// 👕 GET PRODUCTS
// =====================================

router.get(

  "/products",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const products =
        await Product.find()

          .sort({
            createdAt: -1
          });


      res.json(products);

    } catch (err) {

      console.log(
        "FETCH PRODUCTS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);


// =====================================
// 🎟 GET COUPONS
// =====================================

router.get(

  "/coupons",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const coupons =
        await Coupon.find()

          .sort({
            createdAt: -1
          });


      res.json(coupons);

    } catch (err) {

      console.log(
        "FETCH COUPONS ERROR:",
        err
      );

      res.status(500).json({

        error:
          err.message
      });
    }
  }
);

// =====================================
// DELETE ORDER
// =====================================

router.delete(

  "/orders/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const order =
        await Order.findById(
          req.params.id
        );


      if (!order) {

        return res.status(404)
          .json({

            error:
              "Order not found"
          });
      }


      await Order.findByIdAndDelete(
        req.params.id
      );


      res.json({

        success: true,

        message:
          "Order deleted"
      });

    } catch (err) {

      console.log(
        "DELETE ORDER ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);

// =====================================
// CREATE COUPON
// =====================================

router.post(

  "/coupons",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      const {
        code,
        discountType,
        discountValue,
        expiryDate,
        minOrderAmount,
        maxDiscount,
        maxUsage
      } = req.body;


      const existing =
        await Coupon.findOne({

          code: code.toUpperCase()
        });


      if (existing) {

        return res.status(400)
          .json({

            error:
              "Coupon already exists"
          });
      }


      const coupon =
        new Coupon({

          code:
            code.toUpperCase(),

          discountType: discountType || "percentage",
          discountValue: Number(discountValue),
          expiryDate,
          minOrderAmount: Number(minOrderAmount) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          maxUsage: maxUsage ? Number(maxUsage) : null
        });


      await coupon.save();


      res.json(coupon);

    } catch (err) {

      console.log(
        "CREATE COUPON ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);


// =====================================
// VALIDATE COUPON (for frontend cart/checkout)
// =====================================

router.post(

  "/coupons/validate",

  authMiddleware, // users can validate coupons

  async (req, res) => {

    try {

      const {
        code,
        subtotal
      } = req.body;


      if (!code) {
        return res.status(400).json({
          error: "Coupon code is required"
        });
      }


      const coupon =
        await Coupon.findOne({

          code: code.toUpperCase()
        });


      if (!coupon) {
        return res.status(404).json({
          valid: false,
          error: "Invalid coupon code"
        });
      }


      // Check if coupon is valid
      const validation = coupon.isValid(Number(subtotal) || 0);

      if (!validation.valid) {
        return res.status(400).json({
          valid: false,
          error: validation.reason
        });
      }


      // Calculate discount
      const discountAmount = coupon.calculateDiscount(Number(subtotal) || 0);


      res.json({
        valid: true,
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount
        },
        discountAmount: Math.round(discountAmount * 100) / 100 // Round to 2 decimal places
      });

    } catch (err) {

      console.log(
        "VALIDATE COUPON ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);


// =====================================
// DELETE COUPON
// =====================================

router.delete(

  "/coupons/:id",

  authMiddleware,

  adminMiddleware,

  async (req, res) => {

    try {

      await Coupon.findByIdAndDelete(
        req.params.id
      );


      res.json({

        success: true
      });

    } catch (err) {

      console.log(
        "DELETE COUPON ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);
// =====================================
// 💰 PRICING MANAGEMENT
// =====================================

const {
  getAllPricing,
  getPricingByKey,
  updatePrice
} = require("../config/pricing");

// GET all pricing
router.get(
  "/pricing",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const pricing = getAllPricing();
      res.json({ success: true, pricing });
    } catch (err) {
      console.log("GET PRICING ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// UPDATE single price
router.put(
  "/pricing/:key",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { key } = req.params;
      const { price } = req.body;

      if (price === undefined || price === null) {
        return res.status(400).json({ error: "Price is required" });
      }

      const updated = updatePrice(key, price);

      if (!updated) {
        return res.status(404).json({ error: "Pricing key not found" });
      }

      res.json({ success: true, pricing: updated });
    } catch (err) {
      console.log("UPDATE PRICING ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// BULK UPDATE prices
router.put(
  "/pricing",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { prices } = req.body; // array of { key, price }

      if (!Array.isArray(prices)) {
        return res.status(400).json({ error: "Prices array is required" });
      }

      const updated = [];
      const errors = [];

      for (const { key, price } of prices) {
        const result = updatePrice(key, price);
        if (result) {
          updated.push(result);
        } else {
          errors.push({ key, error: "Invalid pricing key" });
        }
      }

      res.json({ success: true, updated, errors });
    } catch (err) {
      console.log("BULK UPDATE PRICING ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =====================================
// 📦 INVENTORY MANAGEMENT
// =====================================

// Fallback mock products for when database is empty
const MOCK_INVENTORY_PRODUCTS = [
  {
    _id: "mock-tshirt",
    name: "Classic Cotton T-Shirt",
    category: "tshirt",
    price: 999,
    image: "",
    variants: [
      { color: "white", size: "S", stock: 50 },
      { color: "white", size: "M", stock: 50 },
      { color: "white", size: "L", stock: 50 },
      { color: "white", size: "XL", stock: 30 },
      { color: "black", size: "S", stock: 50 },
      { color: "black", size: "M", stock: 50 },
      { color: "black", size: "L", stock: 50 },
      { color: "black", size: "XL", stock: 30 },
      { color: "red", size: "S", stock: 30 },
      { color: "red", size: "M", stock: 30 },
      { color: "red", size: "L", stock: 30 },
      { color: "red", size: "XL", stock: 20 }
    ]
  },
  {
    _id: "mock-hoodie",
    name: "Premium Hoodie",
    category: "hoodie",
    price: 1499,
    image: "",
    variants: [
      { color: "black", size: "S", stock: 30 },
      { color: "black", size: "M", stock: 30 },
      { color: "black", size: "L", stock: 30 },
      { color: "black", size: "XL", stock: 20 },
      { color: "white", size: "S", stock: 25 },
      { color: "white", size: "M", stock: 25 },
      { color: "white", size: "L", stock: 25 },
      { color: "white", size: "XL", stock: 15 },
      { color: "blue", size: "S", stock: 20 },
      { color: "blue", size: "M", stock: 20 },
      { color: "blue", size: "L", stock: 20 },
      { color: "blue", size: "XL", stock: 15 }
    ]
  },
  {
    _id: "mock-oversized",
    name: "Oversized T-Shirt",
    category: "oversized",
    price: 1199,
    image: "",
    variants: [
      { color: "white", size: "S", stock: 40 },
      { color: "white", size: "M", stock: 40 },
      { color: "white", size: "L", stock: 40 },
      { color: "white", size: "XL", stock: 30 },
      { color: "black", size: "S", stock: 40 },
      { color: "black", size: "M", stock: 40 },
      { color: "black", size: "L", stock: 40 },
      { color: "black", size: "XL", stock: 30 },
      { color: "red", size: "S", stock: 25 },
      { color: "red", size: "M", stock: 25 },
      { color: "red", size: "L", stock: 25 },
      { color: "red", size: "XL", stock: 20 }
    ]
  },
  {
    _id: "mock-kids",
    name: "Kids T-Shirt",
    category: "kids",
    price: 799,
    image: "",
    variants: [
      { color: "white", size: "S", stock: 40 },
      { color: "white", size: "M", stock: 40 },
      { color: "white", size: "L", stock: 40 },
      { color: "black", size: "S", stock: 35 },
      { color: "black", size: "M", stock: 35 },
      { color: "black", size: "L", stock: 35 },
      { color: "red", size: "S", stock: 30 },
      { color: "red", size: "M", stock: 30 },
      { color: "red", size: "L", stock: 30 }
    ]
  }
];

// GET inventory grouped by product type + color
router.get(
  "/inventory",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });

      // If no products in database, use fallback mock data
      const productsToUse = products.length > 0 ? products : MOCK_INVENTORY_PRODUCTS;
      const usingMockData = products.length === 0;

      // Group variants by product type + color for easier frontend consumption
      const inventoryByTypeAndColor = {};

      productsToUse.forEach(product => {
        const productType = product.category || "tshirt";

        if (!inventoryByTypeAndColor[productType]) {
          inventoryByTypeAndColor[productType] = {};
        }

        (product.variants || []).forEach(variant => {
          const color = variant.color.toLowerCase();
          const size = variant.size.toUpperCase();
          const stock = variant.stock || 0;

          if (!inventoryByTypeAndColor[productType][color]) {
            inventoryByTypeAndColor[productType][color] = {
              totalStock: 0,
              sizes: {}
            };
          }

          inventoryByTypeAndColor[productType][color].sizes[size] = stock;
          inventoryByTypeAndColor[productType][color].totalStock += stock;
        });
      });

      res.json({
        success: true,
        inventory: inventoryByTypeAndColor,
        products: productsToUse,
        usingMockData
      });
    } catch (err) {
      console.log("FETCH INVENTORY ERROR:", err);
      // On error, also fall back to mock data
      const inventoryByTypeAndColor = {};
      MOCK_INVENTORY_PRODUCTS.forEach(product => {
        const productType = product.category || "tshirt";
        if (!inventoryByTypeAndColor[productType]) {
          inventoryByTypeAndColor[productType] = {};
        }
        (product.variants || []).forEach(variant => {
          const color = variant.color.toLowerCase();
          const size = variant.size.toUpperCase();
          const stock = variant.stock || 0;
          if (!inventoryByTypeAndColor[productType][color]) {
            inventoryByTypeAndColor[productType][color] = {
              totalStock: 0,
              sizes: {}
            };
          }
          inventoryByTypeAndColor[productType][color].sizes[size] = stock;
          inventoryByTypeAndColor[productType][color].totalStock += stock;
        });
      });
      res.json({
        success: true,
        inventory: inventoryByTypeAndColor,
        products: MOCK_INVENTORY_PRODUCTS,
        usingMockData: true
      });
    }
  }
);

// GET available colors for a product type (colors with stock > 0)
router.get(
  "/inventory/colors/:productType",
  authMiddleware,
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

// UPDATE stock for a specific variant
router.put(
  "/inventory/stock",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { productType, color, size, stock } = req.body;

      if (!productType || !color || !size || stock === undefined) {
        return res.status(400).json({ error: "productType, color, size, and stock are required" });
      }

      const product = await Product.findOne({ category: productType });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const variant = product.variants.find(v =>
        v.color.toLowerCase() === color.toLowerCase() &&
        v.size.toLowerCase() === size.toLowerCase()
      );

      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }

      variant.stock = Math.max(0, Number(stock));
      await product.save();

      res.json({
        success: true,
        variant
      });
    } catch (err) {
      console.log("UPDATE STOCK ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ADD/UPDATE stock for a product type + color (bulk upsert sizes)
router.post(
  "/inventory/stock",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { productType, color, sizes } = req.body;

      if (!productType || !color || !Array.isArray(sizes)) {
        return res.status(400).json({ error: "productType, color, and sizes array are required" });
      }

      // Find or create product for this type
      let product = await Product.findOne({ category: productType });

      if (!product) {
        // Create new product with default pricing
        const defaultPrices = {
          tshirt: 999,
          hoodie: 1499,
          oversized: 1199,
          kids: 799
        };
        product = new Product({
          name: productType.charAt(0).toUpperCase() + productType.slice(1),
          category: productType,
          price: defaultPrices[productType] || 999,
          variants: []
        });
      }

      const colorLower = color.toLowerCase();

      // Upsert each size
      sizes.forEach(({ size, stock }) => {
        const sizeUpper = size.toUpperCase();
        const stockNum = Math.max(0, Number(stock) || 0);

        const existingIdx = product.variants.findIndex(v =>
          v.color.toLowerCase() === colorLower &&
          v.size.toLowerCase() === sizeUpper.toLowerCase()
        );

        if (existingIdx >= 0) {
          product.variants[existingIdx].stock = stockNum;
        } else {
          product.variants.push({ color: colorLower, size: sizeUpper, stock: stockNum });
        }
      });

      await product.save();

      res.json({
        success: true,
        product
      });
    } catch (err) {
      console.log("UPSERT STOCK ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ADD a new color to a product type
router.post(
  "/inventory/color",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { productType, color, sizes } = req.body;

      if (!productType || !color || !Array.isArray(sizes)) {
        return res.status(400).json({ error: "productType, color, and sizes array are required" });
      }

      let product = await Product.findOne({ category: productType });

      if (!product) {
        const defaultPrices = {
          tshirt: 999,
          hoodie: 1499,
          oversized: 1199,
          kids: 799
        };
        product = new Product({
          name: productType.charAt(0).toUpperCase() + productType.slice(1),
          category: productType,
          price: defaultPrices[productType] || 999,
          variants: []
        });
      }

      const colorLower = color.toLowerCase();

      // Check if color already exists
      const colorExists = product.variants.some(v => v.color.toLowerCase() === colorLower);
      if (colorExists) {
        return res.status(400).json({ error: `Color "${color}" already exists for this product type` });
      }

      // Add all sizes for this color
      sizes.forEach(({ size, stock }) => {
        product.variants.push({
          color: colorLower,
          size: size.toUpperCase(),
          stock: Math.max(0, Number(stock) || 0)
        });
      });

      await product.save();

      res.json({
        success: true,
        product
      });
    } catch (err) {
      console.log("ADD COLOR ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// REMOVE a color from a product type
router.delete(
  "/inventory/color",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { productType, color } = req.body;

      if (!productType || !color) {
        return res.status(400).json({ error: "productType and color are required" });
      }

      const product = await Product.findOne({ category: productType });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const colorLower = color.toLowerCase();
      const initialCount = product.variants.length;
      product.variants = product.variants.filter(v => v.color.toLowerCase() !== colorLower);

      if (product.variants.length === initialCount) {
        return res.status(404).json({ error: `Color "${color}" not found` });
      }

      await product.save();

      res.json({
        success: true,
        product
      });
    } catch (err) {
      console.log("REMOVE COLOR ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// REMOVE a specific variant (product type + color + size)
router.delete(
  "/inventory/variant",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { productType, color, size } = req.body;

      if (!productType || !color || !size) {
        return res.status(400).json({ error: "productType, color, and size are required" });
      }

      const product = await Product.findOne({ category: productType });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const colorLower = color.toLowerCase();
      const sizeUpper = size.toUpperCase();
      const initialCount = product.variants.length;
      product.variants = product.variants.filter(v =>
        !(v.color.toLowerCase() === colorLower && v.size.toLowerCase() === sizeUpper.toLowerCase())
      );

      if (product.variants.length === initialCount) {
        return res.status(404).json({ error: "Variant not found" });
      }

      await product.save();

      res.json({
        success: true,
        product
      });
    } catch (err) {
      console.log("REMOVE VARIANT ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// CREATE a new product type
router.post(
  "/inventory/product",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { productType, name, price, variants } = req.body;

      if (!productType) {
        return res.status(400).json({ error: "productType is required" });
      }

      const existing = await Product.findOne({ category: productType });
      if (existing) {
        return res.status(400).json({ error: `Product type "${productType}" already exists` });
      }

      const product = new Product({
        name: name || productType.charAt(0).toUpperCase() + productType.slice(1),
        category: productType,
        price: price || 999,
        variants: Array.isArray(variants) ? variants : []
      });

      await product.save();

      res.json({
        success: true,
        product
      });
    } catch (err) {
      console.log("CREATE PRODUCT ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports =
  router;