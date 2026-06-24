const mongoose =
  require("mongoose");

const cartSchema =
  new mongoose.Schema(

    {

      userId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true
      },


      // =====================================
      // COMMON
      // =====================================

      productType: {

        type:
          String,

        default:
          "tshirt"
      },

      quantity: {

        type:
          Number,

        default:
          1
      },


      // =====================================
      // SINGLE
      // =====================================

      color:
        String,

      selectedColor:
        String,

      size:
        String,

      side:
        String,

      designScale:
        Number,

      designImage:
        String,

      transparentDesign:
        String,

      prompt:
        String,


      // =====================================
      // COUPLE
      // =====================================

      isCouple: {

        type:
          Boolean,

        default:
          false
      },


      hisDesign:
        String,

      herDesign:
        String,


      hisDesignImage:
        String,

      herDesignImage:
        String,


      hisPrompt:
        String,

      herPrompt:
        String,

      sharedPrompt:
        String,


      hisColor:
        String,

      hisSize:
        String,

      herColor:
        String,

      herSize:
        String,


      hisSide:
        String,

      herSide:
        String,


      hisScale:
        Number,

      herScale:
        Number,


      // =====================================
      // PRICE
      // =====================================

      price: {

        type:
          Number,

        default:
          699
      }

    },

    {
      timestamps:
        true
    }
  );


module.exports =
  mongoose.model(
    "Cart",
    cartSchema
  );
