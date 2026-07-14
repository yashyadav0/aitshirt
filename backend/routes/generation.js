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

// Double-sided artwork is deliberately enhanced independently from couple designs.
async function enhanceDoubleSidePrompt(userPrompt, side) {
  return enhanceSinglePrompt(`
Create an independent ${side} apparel graphic from this idea: ${userPrompt}

The artwork must be a large, centered, oversized graphic print that fills most
of the printable area. It must not be a small chest logo, badge, paired design,
or split composition. Keep it isolated, transparent, print-ready, and without
a garment mockup, t-shirt, or watermark.`);
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

    return null;
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
// FALLBACK IMAGES
// =====================================

async function svgToPngDataUri(svg) {
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function createFallbackSingleImage(preferences, prompt) {
  const color = preferences.selectedColor || preferences.color || "white";
  const productLabel =
    preferences.productType === "hoodie" ? "HOODIE" : "T-SHIRT";
  const bg = color === "black" ? "#111111" : "#f3f3f3";
  const fg = color === "black" ? "#f5f5f5" : "#111111";
  const accent = color === "red" ? "#dc2626" : "#14b8a6";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect width="1024" height="1024" fill="${bg}"/>
      <rect x="96" y="96" width="832" height="832" rx="48" fill="${accent}" opacity="0.12"/>
      <text x="512" y="360" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="700" fill="${fg}">${productLabel}</text>
      <text x="512" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="600" fill="${fg}">${escapeSvgText(color.toUpperCase())}</text>
      <text x="512" y="610" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="${fg}" opacity="0.8">${escapeSvgText(prompt).slice(0, 80)}</text>
      <circle cx="512" cy="760" r="140" fill="${accent}" opacity="0.18"/>
      <path d="M420 760c28-32 56-48 92-48s64 16 92 48" fill="none" stroke="${fg}" stroke-width="16" stroke-linecap="round"/>
    </svg>
  `;

  return svgToPngDataUri(svg);
}


async function createFallbackCoupleImage(preferences, prompt) {
  const color = preferences.selectedColor || preferences.color || "white";
  const bg = color === "black" ? "#101010" : "#f6f6f6";
  const fg = color === "black" ? "#f5f5f5" : "#111111";
  const accent = color === "red" ? "#dc2626" : "#14b8a6";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" viewBox="0 0 2048 1024">
      <rect width="2048" height="1024" fill="${bg}"/>
      <rect x="64" y="64" width="1920" height="896" rx="48" fill="${accent}" opacity="0.12"/>
      <rect x="128" y="128" width="864" height="768" rx="36" fill="${accent}" opacity="0.08"/>
      <rect x="1056" y="128" width="864" height="768" rx="36" fill="${accent}" opacity="0.16"/>
      <text x="560" y="360" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="700" fill="${fg}">LEFT</text>
      <text x="560" y="460" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="600" fill="${fg}">${escapeSvgText(color.toUpperCase())}</text>
      <text x="560" y="560" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="${fg}" opacity="0.8">${escapeSvgText(prompt).slice(0, 54)}</text>
      <text x="1488" y="360" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="700" fill="${fg}">RIGHT</text>
      <text x="1488" y="460" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="600" fill="${fg}">${escapeSvgText(color.toUpperCase())}</text>
      <text x="1488" y="560" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="${fg}" opacity="0.8">${escapeSvgText(prompt).slice(0, 54)}</text>
    </svg>
  `;

  return svgToPngDataUri(svg);
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
        frontPrompt,
        backPrompt,

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

        const referenceInstruction =
          imageParts.length > 0
            ? "\n- use the uploaded reference image as the primary visual source and keep its subject/style recognizable\n"
            : "";

        const finalSinglePrompt =
          `${finalPrompt}${referenceInstruction}`;


        console.log(
          "GENERATING SINGLE DESIGN..."
        );


        // An upload is input to the model only. Never return it as a fallback
        // or put it on a mockup directly.
        const fallbackSingleImage = await createFallbackSingleImage(
          preferences,
          prompt
        );

        const imageUrl =
          (await generateImage(
            finalSinglePrompt,
            imageParts
          )) || fallbackSingleImage;


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
      // DOUBLE MODE
      // =====================================

      if (
        activeMode === "double"
      ) {

        const resolvedFrontPrompt = String(frontPrompt || prompt || "").trim();
        const resolvedBackPrompt = String(backPrompt || prompt || "").trim();

        if (!resolvedFrontPrompt || !resolvedBackPrompt) {
          return res.status(400).json({
            error: "Both front and back design prompts are required."
          });
        }

        // Generate each garment side independently: this is not a split image
        // and does not share couple-design enhancement or rendering logic.
        const [enhancedFrontPrompt, enhancedBackPrompt] = await Promise.all([
          enhanceDoubleSidePrompt(resolvedFrontPrompt, "front"),
          enhanceDoubleSidePrompt(resolvedBackPrompt, "back")
        ]);

        const buildSidePrompt = (enhancedPrompt, side) => `
${enhancedPrompt}

IMPORTANT:
- generate only the ${side}-side artwork as one large centered graphic
- fill most of the printable area like an oversized graphic tee
- do not create a chest logo, badge, emblem, paired artwork, left/right split, or garment mockup
- isolated artwork only, transparent background, print-ready, no watermark
- optimized for a ${preferences.selectedColor} ${preferences.productType}
${imageParts.length ? "- use the uploaded image only as visual reference; create new original artwork rather than copying or placing the source image\n" : ""}`;

        const [frontImage, backImage] = await Promise.all([
          generateImage(buildSidePrompt(enhancedFrontPrompt, "front"), imageParts),
          generateImage(buildSidePrompt(enhancedBackPrompt, "back"), imageParts)
        ]);

        if (!frontImage || !backImage) {
          return res.status(502).json({
            error: "Could not generate both sides. Please try again."
          });
        }

        return res.json({
          success: true,
          frontImage,
          backImage,
          preferences,
          enrichedPrompt: {
            front: enhancedFrontPrompt,
            back: enhancedBackPrompt
          }
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

const referenceInstruction =
  imageParts.length > 0
    ? "\n- use the uploaded reference image(s) as the main source and preserve the uploaded composition/style where possible\n"
    : "";

const finalCouplePrompt =
  `${finalPrompt}${referenceInstruction}`;


console.log(
  "GENERATING COUPLE DESIGN..."
);


const fallbackCoupleImage = await createFallbackCoupleImage(
  preferences,
  prompt
);

const combinedImage =
  (await generateImage(
    finalCouplePrompt,
    imageParts
  )) || fallbackCoupleImage;


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
