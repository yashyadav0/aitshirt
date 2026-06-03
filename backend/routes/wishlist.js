const express =
  require("express");

const Wishlist =
  require("../models/Wishlist");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// =====================================
// ADD TO WISHLIST
// =====================================

router.post(

  "/add",

  authMiddleware,

  async (req, res) => {

    try {

      const data =
        req.body;


      // =====================================
      // CREATE ITEM
      // =====================================

      const wishlistItem =
        new Wishlist({

          userId:
            req.user.id,

          ...data
        });


      await wishlistItem.save();


      res.json({

        success: true,

        message:
          "Added to wishlist"
      });

    } catch (err) {

      console.log(
        "WISHLIST ERROR:",
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
// GET WISHLIST
// =====================================

router.get(

  "/my-wishlist",

  authMiddleware,

  async (req, res) => {

    try {

      const items =
        await Wishlist.find({

          userId:
            req.user.id

        }).sort({

          createdAt:
            -1
        });


      res.json(items);

    } catch (err) {

      console.log(
        "GET WISHLIST ERROR:",
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
// DELETE WISHLIST ITEM
// =====================================

router.delete(

  "/:id",

  authMiddleware,

  async (req, res) => {

    try {

      await Wishlist.findByIdAndDelete(

        req.params.id
      );


      res.json({

        success: true,

        message:
          "Removed from wishlist"
      });

    } catch (err) {

      console.log(
        "DELETE WISHLIST ERROR:",
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