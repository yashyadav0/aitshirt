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

      shirtColor:
        String,

      side:
        String,

      prompt:
        String,

      designScale:
        Number,

      designImage:
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
