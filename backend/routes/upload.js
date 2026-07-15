const express =
  require("express");

const multer =
  require("multer");

const cloudinary =
  require("../config/cloudinary");

const sharp =
  require("sharp");

const authMiddleware =
  require("../middleware/authMiddleware");


const router =
  express.Router();

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function isTransientStorageError(error) {
  const status = error.http_code || error.status || error.response?.status;
  return !status || status === 408 || status === 429 || status >= 500;
}

async function uploadToStorage(base64Image) {
  const maxAttempts = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await cloudinary.uploader.upload(base64Image, {
        folder: "transparent-designs",
        resource_type: "image"
      });
    } catch (error) {
      lastError = error;
      const retry = attempt < maxAttempts && isTransientStorageError(error);
      console.warn("[upload] cloud storage attempt failed", {
        attempt,
        retry,
        message: error.message,
        status: error.http_code || error.status || error.response?.status
      });
      if (!retry) break;
      await wait(500 * attempt);
    }
  }

  throw lastError;
}


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

      if (!SUPPORTED_IMAGE_TYPES.has(req.file.mimetype)) {
        return res.status(415).json({
          error: "Upload accepts PNG, JPG, or WebP artwork only."
        });
      }

      if (!req.file.buffer?.length) {
        return res.status(400).json({
          error: "The uploaded artwork is empty."
        });
      }

      let metadata;
      try {
        metadata = await sharp(req.file.buffer, { animated: false }).metadata();
      } catch (error) {
        return res.status(400).json({
          error: "The uploaded file is not a readable image.",
          details: error.message
        });
      }

      if (!metadata.width || !metadata.height) {
        return res.status(400).json({
          error: "The uploaded artwork has invalid dimensions."
        });
      }

      console.log("[upload] validated artwork", {
        mimeType: req.file.mimetype,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        bytes: req.file.buffer.length,
        hasAlpha: Boolean(metadata.hasAlpha)
      });


      // =====================================
      // BUFFER → BASE64
      // =====================================

      const base64Image =

        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;


      // =====================================
      // CLOUDINARY UPLOAD
      // =====================================

      const result =
        await uploadToStorage(
          base64Image
        );

      if (!result?.secure_url) {
        throw new Error("Cloud storage completed without returning a secure artwork URL.");
      }

      console.log("[upload] storage complete", {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      });


      // =====================================
      // RESPONSE
      // =====================================

      return res.json({

        success: true,

        imageUrl:
          result.secure_url
      });

    } catch (err) {

      console.error("UPLOAD IMAGE ERROR:", {
        stage: "validation or cloud storage",
        message: err.message,
        stack: err.stack
      });

      return res.status(500)
        .json({

          error: "Artwork upload failed.",
          details: err.message
        });
    }
  }
);


module.exports =
  router;
