const express = require("express");

const Order =
  require("../models/Order");

const Cart =
  require("../models/Cart");

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
        shippingAddress
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


      // 💰 CALCULATE TOTAL

      const total =
        cartItems.reduce(

          (acc, item) =>

            acc + (
              item.price || 999
            ),

          0
        );


      // 💾 CREATE ORDER

      const order =
        new Order({

          userId:
            req.user.id,

          items:
            cartItems,

          shippingAddress,

          finalAmount:
            total,

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