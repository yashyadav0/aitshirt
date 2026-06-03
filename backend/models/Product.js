const mongoose =
  require("mongoose");


const productSchema =
  new mongoose.Schema({

    name: {

      type: String,

      required: true
    },


    description: {

      type: String,

      default: ""
    },


    image: {

      type: String,

      default: ""
    },


    price: {

      type: Number,

      required: true
    },


    category: {

      type: String,

      default: "tshirt"
    },


    // =====================================
    // INVENTORY VARIANTS
    // =====================================

    variants: {

      type: [

        {

          color: {

            type: String,

            required: true
          },


          size: {

            type: String,

            required: true
          },


          stock: {

            type: Number,

            default: 0
          }
        }
      ],


      default: [

        {
          color: "black",
          size: "S",
          stock: 10
        },

        {
          color: "black",
          size: "M",
          stock: 10
        },

        {
          color: "black",
          size: "L",
          stock: 10
        },


        {
          color: "white",
          size: "S",
          stock: 10
        },

        {
          color: "white",
          size: "M",
          stock: 10
        },

        {
          color: "white",
          size: "L",
          stock: 10
        },


        {
          color: "red",
          size: "S",
          stock: 10
        },

        {
          color: "red",
          size: "M",
          stock: 10
        },

        {
          color: "red",
          size: "L",
          stock: 10
        }
      ]
    },


    // =====================================
    // FEATURED
    // =====================================

    isFeatured: {

      type: Boolean,

      default: false
    }

  }, {

    timestamps: true
  });


module.exports =
  mongoose.model(

    "Product",

    productSchema
  );