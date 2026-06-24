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
        Number
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

    items: {

      type:
        [mongoose.Schema.Types.Mixed],

      default:
        []
    },

    shippingAddress: {

      type:
        mongoose.Schema.Types.Mixed
    },

    finalAmount:
      {
        type: Number,
        required: true
      },

    paymentStatus:
      String,

    paymentId:
      String,

    orderStatus:
      String

  }, {

    timestamps:
      true
  });


module.exports =
  mongoose.model(

    "Order",

    orderSchema
  );
