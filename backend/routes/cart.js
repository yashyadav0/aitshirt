const express =
  require("express");

const Cart =
  require("../models/Cart");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// =====================================
// ADD TO CART
// =====================================

router.post(

  "/add",

  authMiddleware,

  async (req, res) => {

    try {

      const data =
        req.body;


      const cartItem =
        new Cart({

          userId:
            req.user.id,

          ...data,

          quantity: 1,

          price:
            data.isCouple
              ? 1299
              : 699
        });


      await cartItem.save();


      res.json({

        success: true,

        message:
          "Added to cart"
      });

    } catch (err) {

      console.log(
        "CART ADD ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            "Failed to add to cart"
        });
    }
  }
);


// =====================================
// GET CART
// =====================================

router.get(

  "/my-cart",

  authMiddleware,

  async (req, res) => {

    try {

      const cartItems =

        await Cart.find({

          userId:
            req.user.id

        }).sort({

          createdAt:
            -1
        });


      res.json(
        cartItems
      );

    } catch (err) {

      console.log(
        "GET CART ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            "Failed to fetch cart"
        });
    }
  }
);


// =====================================
// UPDATE QUANTITY
// =====================================

router.put(

  "/update-quantity/:id",

  authMiddleware,

  async (req, res) => {

    try {

      const {
        quantity
      } = req.body;


      const updatedItem =

        await Cart.findByIdAndUpdate(

          req.params.id,

          {
            quantity
          },

          {
            returnDocument: "after"
          }
        );


      res.json({

        success: true,

        item:
          updatedItem
      });

    } catch (err) {

      console.log(
        "UPDATE QUANTITY ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            "Failed to update quantity"
        });
    }
  }
);


// =====================================
// REMOVE ITEM
// =====================================

router.delete(

  "/remove/:id",

  authMiddleware,

  async (req, res) => {

    try {

      await Cart.findByIdAndDelete(
        req.params.id
      );


      res.json({

        success: true,

        message:
          "Item removed"
      });

    } catch (err) {

      console.log(
        "REMOVE CART ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            "Failed to remove item"
        });
    }
  }
);


module.exports =
  router;