const express =
  require("express");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const router =
  express.Router();


// ✅ FIREBASE PHONE LOGIN
router.post(

  "/firebase-login",

  async (req, res) => {

    try {

      const { phone } =
        req.body;

      if (!phone) {

        return res.status(400)
          .json({

            error:
              "Phone number required"
          });
      }


      // 🔍 Find user
      let user =
        await User.findOne({
          phone
        });


      // 🆕 Create if not exists
      if (!user) {

        user = new User({

          phone,

          weeklyPromptsLeft: 5,

          extraPrompts: 0,

          promptCreditBalance: 0,

          lastPromptReset:
            new Date(),

          role: "user"
        });

        await user.save();
      }


      // 🚫 Block check
      if (user.isBlocked) {

        return res.status(403)
          .json({

            error:
              "User is blocked"
          });
      }


      // 🔑 JWT
      const token =
        jwt.sign(

          {
            id: user._id,
            role: user.role
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "7d"
          }
        );


      // ✅ Response
      res.json({

        token,

        user: {

          id: user._id,

          role: user.role,

          phone: user.phone
        }
      });

    } catch (err) {

      console.log(
        "FIREBASE LOGIN ERROR:",
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

module.exports = router;