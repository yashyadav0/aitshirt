const mongoose =
  require("mongoose");

const couponSchema =
  new mongoose.Schema({

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },

    // Discount type: "percentage" or "fixed"
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage"
    },

    // For percentage: value is percentage (e.g., 10 = 10%)
    // For fixed: value is amount in INR (e.g., 500 = ₹500)
    discountValue: {
      type: Number,
      required: true
    },

    expiryDate: {
      type: Date,
      required: true
    },

    active: {
      type: Boolean,
      default: true
    },

    // Optional: minimum order amount for coupon to apply
    minOrderAmount: {
      type: Number,
      default: 0
    },

    // Optional: max discount cap for percentage coupons
    maxDiscount: {
      type: Number,
      default: null
    },

    // Usage tracking
    usageCount: {
      type: Number,
      default: 0
    },

    maxUsage: {
      type: Number,
      default: null // null = unlimited
    }

  }, {
    timestamps: true
  });

// Instance method to calculate discount amount
couponSchema.methods.calculateDiscount = function(subtotal) {
  if (this.discountType === "percentage") {
    const discount = (subtotal * this.discountValue) / 100;
    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      return this.maxDiscount;
    }
    return discount;
  } else {
    // Fixed amount discount
    // Don't exceed subtotal
    return Math.min(this.discountValue, subtotal);
  }
};

// Instance method to check if coupon is valid
couponSchema.methods.isValid = function(subtotal = 0) {
  if (!this.active) return { valid: false, reason: "Coupon is inactive" };

  const now = new Date();
  if (this.expiryDate < now) return { valid: false, reason: "Coupon has expired" };

  if (this.maxUsage && this.usageCount >= this.maxUsage) {
    return { valid: false, reason: "Coupon usage limit reached" };
  }

  if (subtotal < this.minOrderAmount) {
    return { valid: false, reason: `Minimum order amount of ₹${this.minOrderAmount} required` };
  }

  return { valid: true };
};

module.exports =
  mongoose.model(
    "Coupon",
    couponSchema
  );