// Seed script to create default coupons
// Run with: node backend/seedCoupons.js

require("dotenv").config();
const mongoose = require("mongoose");
const Coupon = require("./models/Coupon");

async function seedCoupons() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // 1. WELCOME10 - 10% percentage discount
    const welcomeCoupon = await Coupon.findOneAndUpdate(
      { code: "WELCOME10" },
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10, // 10%
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        active: true,
        minOrderAmount: 0,
        maxDiscount: 500, // Cap at ₹500
        maxUsage: null, // Unlimited
        usageCount: 0
      },
      { upsert: true, new: true }
    );
    console.log("✅ Created/Updated WELCOME10:", welcomeCoupon);

    // 2. FLAT500 - ₹500 fixed discount
    const flatCoupon = await Coupon.findOneAndUpdate(
      { code: "FLAT500" },
      {
        code: "FLAT500",
        discountType: "fixed",
        discountValue: 500, // ₹500
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        active: true,
        minOrderAmount: 1000, // Min ₹1000 order
        maxDiscount: null,
        maxUsage: null, // Unlimited
        usageCount: 0
      },
      { upsert: true, new: true }
    );
    console.log("✅ Created/Updated FLAT500:", flatCoupon);

    console.log("\n🎉 Default coupons seeded successfully!");
    console.log("   WELCOME10 - 10% off (max ₹500)");
    console.log("   FLAT500   - ₹500 off (min order ₹1000)");

  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCoupons();