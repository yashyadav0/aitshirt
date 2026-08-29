const express = require("express");

const Order =
  require("../models/Order");

const Cart =
  require("../models/Cart");

const User =
  require("../models/User");

const Coupon =
  require("../models/Coupon");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// =====================================
// 📦 PLACE ORDER
// =====================================

router.post(

  "/place-order",

  authMiddleware,

  async (req, res) => {

    try {

      const {
        shippingAddress,
        couponCode
      } = req.body;


      // 🛒 GET CART ITEMS

      const cartItems =
        await Cart.find({

          userId:
            req.user.id
        });


      // ❌ EMPTY CART

      if (
        cartItems.length === 0
      ) {

        return res.status(400)
          .json({

            error:
              "Cart is empty"
          });
      }


      // 💰 CALCULATE SUBTOTAL (from cart item prices)

      const subtotal =
        cartItems.reduce(

          (acc, item) =>

            acc + (item.price * item.quantity),

          0
        );


      // 🎟 APPLY COUPON IF PROVIDED

      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

        if (coupon) {
          const validation = coupon.isValid(subtotal);

          if (validation.valid) {
            discountAmount = coupon.calculateDiscount(subtotal);
            appliedCoupon = {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              discountAmount: Math.round(discountAmount * 100) / 100
            };

            // Increment usage count
            coupon.usageCount += 1;
            await coupon.save();
          }
        }
      }


      // 💰 CALCULATE FINAL AMOUNT

      const finalAmount = Math.max(0, subtotal - discountAmount);


      // 💾 CREATE ORDER

      const order =
        new Order({

          userId:
            req.user.id,

          items:
            cartItems,

          shippingAddress,

          // Store both subtotal and final amount for transparency
          subtotal,
          discountAmount: Math.round(discountAmount * 100) / 100,
          appliedCoupon,
          finalAmount,

          paymentStatus:
            "pending",

          orderStatus:
            "processing"
        });


      // 💾 SAVE ORDER

      await order.save();


      // 🛒 CLEAR CART

      await Cart.deleteMany({

        userId:
          req.user.id
      });


      // 🎁 POST-ORDER REWARD — grant extra prompts on every paid order
      // (safe, non-destructive; admin can still assign named tiers manually)

      try {

        const buyer =
          await User.findById(
            req.user.id
          );

        if (buyer) {
          buyer.extraPrompts =
            (buyer.extraPrompts || 0) + 10;

          // 🔁 Auto-promote to "recurring" tier after first order
          // (only if they're still on "normal" tier)
          if (buyer.tier === "normal") {
            buyer.tier = "recurring";
            buyer.weeklyLimit = 20;
            buyer.weeklyPromptsLeft = 20;
            buyer.tierAssignedAt = new Date();
          }

          await buyer.save();
        }

      } catch (rewardErr) {

        console.log(
          "POST-ORDER REWARD ERROR:",
          rewardErr
        );
      }


      // ✅ RESPONSE

      res.json({

        success: true,

        message:
          "Order created successfully",

        order
      });

    } catch (err) {

      console.log(
        "PLACE ORDER ERROR:",
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
// 📜 GET USER ORDERS
// =====================================

router.get(

  "/my-orders",

  authMiddleware,

  async (req, res) => {

    try {

      const orders =
        await Order.find({

          userId:
            req.user.id

        }).sort({

          createdAt: -1
        });


      res.json(orders);

    } catch (err) {

      console.log(
        "GET ORDERS ERROR:",
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


module.exports =
  router;