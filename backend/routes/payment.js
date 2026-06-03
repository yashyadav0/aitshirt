const express = require("express");

const crypto = require("crypto");

const razorpay =
  require("../config/razorpay");

const Order =
  require("../models/Order");

const Cart =
  require("../models/Cart");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();


// 💳 Create Razorpay Order
router.post(
  "/create-order",
  authMiddleware,
  async (req, res) => {

    try {

      const { orderId } = req.body;

      // 🔍 Find order
      const order =
        await Order.findById(orderId);

      if (!order) {

        return res.status(404).json({
          error: "Order not found"
        });
      }

      // 💰 Razorpay expects paise
      const options = {

        amount:
          order.finalAmount * 100,

        currency: "INR",

        receipt:
          order._id.toString()
      };

      // 🚀 Create Razorpay order
      const razorpayOrder =
        await razorpay.orders.create(
          options
        );

      res.json({

        message:
          "Razorpay order created",

        razorpayOrder
      });

    } catch (err) {

      console.log(
        "CREATE RAZORPAY ORDER ERROR:",
        err
      );

      res.status(500).json({
        error: err.message
      });
    }
  }
);


// ✅ Verify Razorpay Payment
router.post(
  "/verify",
  authMiddleware,
  async (req, res) => {

    try {

      const {

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature,

        orderId

      } = req.body;

      // 🔐 Generate signature
      const generatedSignature =
        crypto
          .createHmac(

            "sha256",

            process.env
              .RAZORPAY_KEY_SECRET
          )

          .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
          )

          .digest("hex");

      // ❌ Verification failed
      if (

        generatedSignature !==
        razorpay_signature

      ) {

        return res.status(400).json({

          error:
            "Payment verification failed"
        });
      }

      // 🔍 Find order
      const order =
        await Order.findById(orderId);

      if (!order) {

        return res.status(404).json({
          error: "Order not found"
        });
      }

      // ✅ Mark paid
      order.paymentStatus =
        "paid";

      order.paymentId =
        razorpay_payment_id;

      await order.save();


      // 🛒 Clear user cart
      await Cart.deleteMany({

        userId:
          req.user.id
      });


      res.json({

        message:
          "Payment verified successfully",

        order
      });

    } catch (err) {

      console.log(
        "VERIFY PAYMENT ERROR:",
        err
      );

      res.status(500).json({
        error: err.message
      });
    }
  }
);


module.exports = router;