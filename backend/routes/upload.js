const express =
  require("express");

const multer =
  require("multer");

const cloudinary =
  require("../config/cloudinary");

const authMiddleware =
  require("../middleware/authMiddleware");


const router =
  express.Router();


// =========================================
// MULTER
// =========================================

const storage =
  multer.memoryStorage();

const upload =
  multer({

    storage,

    limits: {

      fileSize:
        10 * 1024 * 1024
    }
  });


// =========================================
// ☁️ UPLOAD IMAGE
// =========================================

router.post(

  "/",

  authMiddleware,

  upload.single(
    "image"
  ),

  async (req, res) => {

    try {

      // =====================================
      // NO FILE
      // =====================================

      if (!req.file) {

        return res.status(400)
          .json({

            error:
              "No image uploaded"
          });
      }


      // =====================================
      // BUFFER → BASE64
      // =====================================

      const base64Image =

        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;


      // =====================================
      // CLOUDINARY UPLOAD
      // =====================================

      const result =

        await cloudinary
          .uploader
          .upload(

            base64Image,

            {

              folder:
                "transparent-designs",

              resource_type:
                "image",

              format:
                "png",

              quality:
                "auto",

              fetch_format:
                "auto"
            }
          );


      // =====================================
      // RESPONSE
      // =====================================

      return res.json({

        success: true,

        imageUrl:
          result.secure_url
      });

    } catch (err) {

      console.log(
        "UPLOAD IMAGE ERROR:",
        err
      );

      return res.status(500)
        .json({

          error:
            err.message
        });
    }
  }
);


module.exports =
  router;