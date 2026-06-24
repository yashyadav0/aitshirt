const mongoose =
  require("mongoose");

const wishlistSchema =
  new mongoose.Schema({

    userId: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref:
        "User",

      required:
        true
    },


    productType: {

      type:
        String,

      default:
        "tshirt"
    },


    // =====================================
    // SINGLE DESIGN
    // =====================================

    color:
      String,

    selectedColor:
      String,

    size:
      String,

    side:
      String,

    prompt:
      String,

    designImage:
      String,

    designScale:
      Number,


    // =====================================
    // COUPLE DESIGN
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

    "Wishlist",

    wishlistSchema
  );
