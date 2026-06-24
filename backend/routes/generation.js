const sharp =
  require("sharp");
  
const express =
  require("express");

const multer =
  require("multer");

const axios =
  require("axios");

const Generation =
  require("../models/Generation");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  buildPreferenceEnrichedPrompt,
  normalizePreferences
} = require("../config/designPreferences");


const router =
  express.Router();


// =====================================
// MULTER
// =====================================

const storage =
  multer.memoryStorage();

const upload =
  multer({

    storage,

    limits: {

      fileSize:
        5 * 1024 * 1024
    }
  });


// =====================================
// SINGLE PROMPT ENHANCER
// =====================================

async function enhanceSinglePrompt(
  userPrompt
) {

  try {

    const enhancerPrompt = `

You are an elite AI fashion prompt engineer.

Convert the user's idea into a premium apparel-generation prompt.

Rules:

- keep original subject intact
- improve fashion aesthetic if requested
- improve typography instructions if requested
- improve apparel composition
- improve streetwear quality
- maintain strong central composition
- keep prompt under 70 words
- isolated artwork only
- transparent background
- no mockup
- no tshirt
- no watermark
- print-ready design

User Prompt:
${userPrompt}

Return ONLY the enhanced prompt.

`;


    const response =
      await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,

        {

          contents: [

            {

              parts: [

                {
                  text:
                    enhancerPrompt
                }
              ]
            }
          ]
        },

        {
          timeout:
            30000
        }
      );


    return (

      response.data
        ?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text

      || userPrompt
    );

  } catch (err) {

    console.log(
      "SINGLE PROMPT ENHANCER ERROR:",
      err.response?.data
      || err.message
    );

    return userPrompt;
  }
}


// =====================================
// COUPLE PROMPT ENHANCER
// =====================================

async function enhanceCouplePrompt(
  userPrompt
) {

  try {

    const enhancerPrompt = `

You are an elite AI fashion prompt engineer specializing in coordinated couple apparel designs.

Convert the user's idea into a cohesive premium couple-design generation prompt.

Rules:

- keep original subject intact
- maintain emotional consistency
- maintain coordinated aesthetic
- maintain visual harmony
- create split composition
- place one coordinated design on the LEFT side and the complementary matching design on the RIGHT side
- maintain balanced composition between both sides
- coordinated poses, energy, symbolism, or visual connection if applicable
- improve apparel composition
- improve streetwear quality
- keep prompt under 70 words
- isolated artwork only
- transparent background
- no mockup
- no tshirt
- no watermark
- print-ready design

User Prompt:
${userPrompt}

Return ONLY the enhanced prompt.

`;


    const response =
      await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,

        {

          contents: [

            {

              parts: [

                {
                  text:
                    enhancerPrompt
                }
              ]
            }
          ]
        },

        {
          timeout:
            30000
        }
      );


    return (

      response.data
        ?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text

      || userPrompt
    );

  } catch (err) {

    console.log(
      "COUPLE PROMPT ENHANCER ERROR:",
      err.response?.data
      || err.message
    );

    return userPrompt;
  }
}


// =====================================
// IMAGE GENERATION
// =====================================

async function generateImage(
  finalPrompt,
  imageParts = []
) {

  try {

    console.log(
      "STARTING IMAGE GENERATION..."
    );

    console.log(
      "REFERENCE IMAGES:",
      imageParts.length
    );

    console.log(
      "PROMPT:",
      finalPrompt
    );


    // =====================================
    // LIMIT REFERENCE IMAGES
    // =====================================

    const limitedImageParts =
      imageParts.slice(0, 2);


    // =====================================
    // GEMINI REQUEST
    // =====================================

    const response =
      await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,

        {

          contents: [

            {

              role: "user",

              parts: [

                {
                  text: finalPrompt
                },

                ...limitedImageParts
              ]
            }
          ],

          generationConfig: {

            responseModalities: [
              "TEXT",
              "IMAGE"
            ],

            temperature: 0.4,

            topP: 0.95,

            topK: 32,

            maxOutputTokens: 512
          }
        },

        {

          timeout: 45000,

          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );


    console.log(
      "GEMINI RESPONSE RECEIVED"
    );


    const candidate =
      response.data
        ?.candidates?.[0];


    if (!candidate) {

      console.log(
        "NO CANDIDATES"
      );

      console.log(
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      throw new Error(
        "No candidates returned"
      );
    }


    const parts =
      candidate
        ?.content
        ?.parts || [];


    console.log(
      "PARTS RECEIVED:",
      parts.length
    );


    const imagePart =
      parts.find(

        (part) =>

          part.inlineData &&
          part.inlineData.data
      );


    if (!imagePart) {

      console.log(
        "NO IMAGE PART FOUND"
      );

      console.log(
        JSON.stringify(
          parts,
          null,
          2
        )
      );

      throw new Error(
        "No image generated"
      );
    }


    console.log(
      "IMAGE GENERATED SUCCESSFULLY"
    );


    return `data:image/png;base64,${imagePart.inlineData.data}`;

  } catch (err) {

    console.log(
      "IMAGE GENERATION ERROR:"
    );

    console.log(
      err.response?.data
      || err.message
    );

    throw new Error(
      "Gemini image generation failed"
    );
  }
}

// =====================================
// SPLIT IMAGE
// =====================================

async function splitImage(
  base64Image
) {

  try {

    const imageBuffer =
      Buffer.from(

        base64Image.replace(
          /^data:image\/\w+;base64,/,
          ""
        ),

        "base64"
      );


    // =====================================
    // RESIZE TO SAFE SIZE
    // =====================================

    const resizedBuffer =
      await sharp(imageBuffer)

        .resize({

          width: 2048,

          height: 1024,

          fit: "contain",
          background: {
            r: 0,
            g: 0,
            b: 0,
            alpha: 0
          }
        })

        .png()

        .toBuffer();


    // =====================================
    // LEFT IMAGE
    // =====================================

    const leftBuffer =
      await sharp(resizedBuffer)

        .extract({

          left: 0,

          top: 0,

          width: 1024,

          height: 1024
        })

        .png()

        .toBuffer();


    // =====================================
    // RIGHT IMAGE
    // =====================================

    const rightBuffer =
      await sharp(resizedBuffer)

        .extract({

          left: 1024,

          top: 0,

          width: 1024,

          height: 1024
        })

        .png()

        .toBuffer();


    return {

      leftImage:
`data:image/png;base64,${leftBuffer.toString("base64")}`,

      rightImage:
`data:image/png;base64,${rightBuffer.toString("base64")}`
    };

  } catch (err) {

    console.log(
      "SPLIT IMAGE ERROR:",
      err
    );

    throw err;
  }
}


// =====================================
// CREATE GENERATION
// =====================================

router.post(

  "/create",

  //authMiddleware, remove comment done for testing 

  upload.array(
    "referenceImages"
  ),

  async (req, res) => {

    try {

      const {

        generationMode,

        designType,

        productType = "tshirt",

        color = "white",
        selectedColor,

        prompt,

        preferences: rawPreferences

      } = req.body;

      const activeMode =
        designType
        || generationMode
        || "single";

      let parsedPreferences = {};

      if (rawPreferences) {
        try {
          parsedPreferences =
            typeof rawPreferences === "string"
              ? JSON.parse(rawPreferences)
              : rawPreferences;
        } catch {
          parsedPreferences = {};
        }
      }

      const preferences = normalizePreferences({
        ...parsedPreferences,
        productType,
        designType: activeMode,
        selectedColor: selectedColor || color,
        color: selectedColor || color
      });


      let imageParts = [];


      // =====================================
      // REFERENCE IMAGES
      // =====================================

      if (
        req.files &&
        req.files.length > 0
      ) {

        imageParts =
          req.files.map(
            (file) => ({

              inlineData: {

                mimeType:
                  file.mimetype,

                data:
                  file.buffer.toString(
                    "base64"
                  )
              }
            })
          );
      }


      // =====================================
      // SINGLE MODE
      // =====================================

      if (
        activeMode === "single"
      ) {

        console.log(
          "ENHANCING SINGLE PROMPT..."
        );


        const preferencePrompt =
          buildPreferenceEnrichedPrompt(
            prompt,
            preferences
          );


        const enhancedPrompt =
          await enhanceSinglePrompt(
            preferencePrompt
          );


        console.log(
          "ENHANCED PROMPT:",
          enhancedPrompt
        );


        const finalPrompt = `

${enhancedPrompt}

IMPORTANT:

- isolated artwork only
- transparent background
- apparel graphic only
- premium streetwear aesthetic
        - optimized for ${preferences.selectedColor} ${preferences.productType}
- no mockup
- no tshirt
- no watermark
- print-ready
-Generate an actual image output based on these points

`;


        console.log(
          "GENERATING SINGLE DESIGN..."
        );


        const imageUrl =
          await generateImage(
            finalPrompt,
            imageParts
          );


        console.log(
          "SINGLE DESIGN GENERATED"
        );


        return res.json({

          success: true,

          imageUrl,

          preferences,

          enrichedPrompt:
            enhancedPrompt
        });
      }


      // =====================================
      // COUPLE MODE
      // =====================================

console.log(
  "ENHANCING COUPLE PROMPT..."
);


const enhancedPrompt =
  await enhanceCouplePrompt(
    buildPreferenceEnrichedPrompt(
      prompt,
      preferences
    )
  );


console.log(
  "ENHANCED COUPLE:",
  enhancedPrompt
);


const finalPrompt = `

${enhancedPrompt}

IMPORTANT:

- perfect symmetrical vertical split composition
- left design centered in left half
- right design centered in right half
- balanced spacing
- isolated artwork only
- transparent background
- apparel graphic only
- premium streetwear aesthetic
- no mockup
- no tshirt
- no watermark
- print-ready

`;


console.log(
  "GENERATING COUPLE DESIGN..."
);


const combinedImage =
  await generateImage(
    finalPrompt,
    imageParts
  );


console.log(
  "COUPLE DESIGN GENERATED"
);


console.log(
  "SPLITTING IMAGE..."
);


const {

  leftImage,
  rightImage

} = await splitImage(
  combinedImage
);


console.log(
  "IMAGE SPLIT SUCCESS"
);


return res.json({

  success: true,

  hisImage:
    leftImage,

  herImage:
    rightImage,

  preferences,

  enrichedPrompt:
    enhancedPrompt
});

    } catch (err) {

      console.log(
        "GENERATION ERROR:"
      );

      console.log(
        err.response?.data
        || err.message
      );


      return res.status(500)
        .json({

          success: false,

          error:
            "Generation failed"
        });
    }
  }
);


// =====================================
// SAVE GENERATION
// =====================================

router.post(

  "/save",

  authMiddleware,

  async (req, res) => {

    try {

      const data =
        req.body;

      const preferences =
        normalizePreferences({
          ...(data.preferences || {}),
          productType:
            data.productType,
          designType:
            data.designType
            || data.generationMode
            || (data.isCouple ? "couple" : "single"),
          selectedColor:
            data.selectedColor
            || data.color
            || data.shirtColor
            || data.hisColor,
          color:
            data.selectedColor
            || data.color
            || data.shirtColor
            || data.hisColor
        });


      const generation =
        new Generation({

          userId:
            req.user.id,

          ...data,

          preferences,

          productType:
            preferences.productType,

          designType:
            preferences.designType,

          selectedColor:
            preferences.selectedColor,

          color:
            preferences.color
            || preferences.selectedColor
        });


      await generation.save();


      res.json({

        success: true,

        message:
          "Generation saved"
      });

    } catch (err) {

      console.log(
        "SAVE ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            "Failed to save generation"
        });
    }
  }
);


// =====================================
// GET HISTORY
// =====================================

router.get(

  "/my-generations",

  authMiddleware,

  async (req, res) => {

    try {

      const generations =

        await Generation.find({

          userId:
            req.user.id

        }).sort({

          createdAt:
            -1
        });


      res.json(
        generations
      );

    } catch (err) {

      console.log(
        "GET HISTORY ERROR:",
        err
      );

      res.status(500)
        .json({

          error:
            "Failed to fetch history"
        });
    }
  }
);


module.exports =
  router;
