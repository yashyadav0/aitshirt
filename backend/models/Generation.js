const mongoose =
  require("mongoose");

const generationSchema =
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
      // SINGLE DESIGN
      // =====================================

      productType: {

        type:
          String,

        default:
          "tshirt"
      },

      designType: {

        type:
          String,

        default:
          "single"
      },

      color: {

        type:
          String
      },

      preferences: {

        productType: {

          type:
            String,

          default:
            "tshirt"
        },

        designType: {

          type:
            String,

          default:
            "single"
        },

        color: {

          type:
            String,

          default:
            "white"
        }
      },

      shirtColor:
        String,

      size:
        String,

      side:
        String,

      prompt:
        String,

      generationMode:
        String,

      designScale:
        Number,

      designImage:
        String,

      transparentDesign:
        String,


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

      couplePrompt:
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

    },

    {
      timestamps:
        true
    }
  );


module.exports =
  mongoose.model(
    "Generation",
    generationSchema
  );
