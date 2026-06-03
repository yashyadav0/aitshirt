const mongoose =
  require("mongoose");

const orderSchema =
  new mongoose.Schema({

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

    quantity: {

      type:
        Number,

      default:
        1
    },

    totalPrice: {

      type:
        Number,

      required:
        true
    },


    status: {

      type:
        String,

      default:
        "pending"
    },


    // =====================================
    // SINGLE
    // =====================================

    color:
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
      Number

  }, {

    timestamps:
      true
  });


module.exports =
  mongoose.model(

    "Order",

    orderSchema
  );