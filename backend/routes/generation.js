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

const User =
  require("../models/User");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  resetIfNeeded,
  hasQuota,
  consumeQuota,
  getQuotaSummary
} = require("../utils/quota");

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
// DOUBLE-SIDE PROMPT ENHANCER
// =====================================

async function enhanceDoubleSidePrompt(
  userPrompt
) {

  try {

    const enhancerPrompt = `

You are an elite AI fashion prompt engineer specializing in dual-panel apparel designs.

The user wants ONE garment with TWO COMPLETELY DIFFERENT graphic designs — one on each half of a vertical split image.

Your job: convert the user's idea into a single continuous prompt describing two different artworks.

Rules:

- describe TWO completely different graphic compositions in one flowing prompt
- the first composition on the left half must be a bold dominant graphic
- the second composition on the right half must be a COMPLETELY DIFFERENT design with its own unique subject, elements, and layout
- the two halves MUST look visually different — different focal points, different compositions, different details
- do NOT mirror, repeat, or duplicate across halves
- improve streetwear quality and apparel composition
- keep total prompt under 70 words
- isolated artwork only, transparent background
- no mockup, no tshirt, no watermark
- ABSOLUTELY NO text, words, letters, or labels of any kind in the artwork
- print-ready design

User Prompt:
${userPrompt}

Return ONLY the enhanced prompt. Describe the left-half design first, then describe a completely different right-half design. Do not use the words LEFT, RIGHT, FRONT, or BACK.

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
      "DOUBLE-SIDE PROMPT ENHANCER ERROR:",
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

    return null;
  }
}


// =====================================
// GENERATE WITH RETRY
// =====================================

async function generateImageWithRetry(
  finalPrompt,
  imageParts = []
) {

  const firstAttempt =
    await generateImage(
      finalPrompt,
      imageParts
    );

  if (firstAttempt) return firstAttempt;

  console.log(
    "Image generation failed, retrying..."
  );

  return await generateImage(
    finalPrompt,
    imageParts
  );
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

async function createFallbackSingleImage(preferences, prompt, variant) {
  const color = preferences.selectedColor || preferences.color || "white";
  const bg = color === "black" ? "#0f0f0f" : "#f8f8f8";
  const accent = color === "red" ? "#991b1b" : color === "black" ? "#475569" : "#0e7490";

  let svg;

  if (variant === "back") {
    // Back variant: geometric / diagonal pattern
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <defs>
          <linearGradient id="backfade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="1024" height="1024" fill="${bg}"/>
        <rect width="1024" height="1024" fill="url(#backfade)"/>
        <polygon points="512,200 720,480 304,480" fill="${accent}" opacity="0.08"/>
        <polygon points="512,824 720,544 304,544" fill="${accent}" opacity="0.08"/>
        <circle cx="512" cy="512" r="120" fill="none" stroke="${accent}" stroke-width="5" opacity="0.14"/>
        <circle cx="512" cy="512" r="210" fill="none" stroke="${accent}" stroke-width="3" opacity="0.09"/>
        <line x1="312" y1="312" x2="712" y2="712" stroke="${accent}" stroke-width="2" opacity="0.06"/>
        <line x1="712" y1="312" x2="312" y2="712" stroke="${accent}" stroke-width="2" opacity="0.06"/>
      </svg>
    `;
  } else {
    // Front variant (default): radial glow, centered
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <defs>
          <radialGradient id="frontglow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
            <stop offset="70%" stop-color="${accent}" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1024" height="1024" fill="${bg}"/>
        <circle cx="512" cy="432" r="300" fill="url(#frontglow)"/>
        <rect x="160" y="260" width="704" height="520" rx="28" fill="${accent}" opacity="0.07"/>
        <circle cx="512" cy="520" r="80" fill="${accent}" opacity="0.12"/>
        <path d="M460 520 Q512 440 564 520" fill="none" stroke="${accent}" stroke-width="6" opacity="0.18" stroke-linecap="round"/>
      </svg>
    `;
  }

  return svgToPngDataUri(svg);
}

async function createReferenceFallbackSingle(files, preferences, prompt) {
  if (!files || files.length === 0) {
    return createFallbackSingleImage(preferences, prompt);
  }

  const color = preferences.selectedColor || preferences.color || "white";
  const bg =
    color === "black"
      ? "#111111"
      : color === "red"
        ? "#fef2f2"
        : "#f4f4f5";
  const accent = color === "black" ? "#e5e7eb" : "#0f172a";

  const base = sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: bg
    }
  });

  const imageBuffer = files[0].buffer;
  const uploaded = await sharp(imageBuffer)
    .resize({
      width: 760,
      height: 760,
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

  const overlay = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect x="70" y="70" width="884" height="884" rx="48" fill="none" stroke="${accent}" stroke-width="10" opacity="0.18"/>
      <text x="512" y="132" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="${accent}" opacity="0.7">REFERENCE IMAGE</text>
    </svg>
  `);

  return base
    .composite([
      { input: uploaded, top: 132, left: 132 },
      { input: overlay, top: 0, left: 0 }
    ])
    .png()
    .toBuffer()
    .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
}

async function createReferenceFallbackCouple(files, preferences, prompt) {
  if (!files || files.length === 0) {
    return createFallbackCoupleImage(preferences, prompt);
  }

  const color = preferences.selectedColor || preferences.color || "white";
  const bg =
    color === "black"
      ? "#101010"
      : color === "red"
        ? "#fef2f2"
        : "#f6f6f6";
  const accent = color === "black" ? "#e5e7eb" : "#0f172a";

  const leftSource = files[0].buffer;
  const rightSource = files[1]?.buffer || files[0].buffer;

  const left = await sharp(leftSource)
    .resize({
      width: 820,
      height: 760,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const right = await sharp(rightSource)
    .resize({
      width: 820,
      height: 760,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: 2048,
      height: 1024,
      channels: 4,
      background: bg
    }
  })
    .composite([
      {
        input: Buffer.from(`
          <svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" viewBox="0 0 2048 1024">
            <rect x="64" y="64" width="1920" height="896" rx="48" fill="none" stroke="${accent}" stroke-width="10" opacity="0.14"/>
            <text x="512" y="132" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="${accent}" opacity="0.7">LEFT REFERENCE</text>
            <text x="1536" y="132" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="${accent}" opacity="0.7">RIGHT REFERENCE</text>
          </svg>
        `),
        top: 0,
        left: 0
      },
      { input: left, top: 128, left: 112 },
      { input: right, top: 128, left: 1112 }
    ])
    .png()
    .toBuffer()
    .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
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

  authMiddleware,

  upload.array(
    "referenceImages"
  ),

  async (req, res) => {

    try {

      // =====================================
      // AUTH + QUOTA ENFORCEMENT
      // =====================================

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      await resetIfNeeded(user);

      if (!hasQuota(user)) {
        return res.status(409).json({
          success: false,
          code: "QUOTA_EXCEEDED",
          error: "You've reached your weekly prompt limit. Upgrade your plan or wait for the weekly reset.",
          quota: getQuotaSummary(user)
        });
      }

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

        const referenceInstruction =
          imageParts.length > 0
            ? "\n- use the uploaded reference image as the primary visual source and keep its subject/style recognizable\n"
            : "";

        const finalSinglePrompt =
          `${finalPrompt}${referenceInstruction}`;


        console.log(
          "GENERATING SINGLE DESIGN..."
        );


        const fallbackSingleImage =
          req.files && req.files.length > 0
            ? await createReferenceFallbackSingle(
                req.files,
                preferences,
                prompt
              )
            : await createFallbackSingleImage(
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


        await consumeQuota(user);

        return res.json({

          success: true,

          imageUrl,

          preferences,

          enrichedPrompt:
            enhancedPrompt,

          quota:
            getQuotaSummary(user)
        });
      }


      // =====================================
      // DOUBLE-SIDE MODE
      // =====================================

      if (
        activeMode === "double"
      ) {

        console.log(
          "GENERATING DOUBLE-SIDE: TWO SEPARATE IMAGES"
        );


        const doubleReferenceInstruction =
          imageParts.length > 0
            ? "\n- use the uploaded reference image(s) as the main source and preserve the uploaded composition/style where possible\n"
            : "";


        // =====================================
        // FRONT DESIGN — direct prompt (no enhancer)
        // =====================================

        console.log(
          "GENERATING FRONT DESIGN..."
        );

        const frontColor =
          preferences.selectedColor
          || preferences.color
          || "white";
        const frontProduct =
          preferences.productType === "hoodie"
            ? "hoodie"
            : "t-shirt";


        const frontFinalPrompt = `
Create a bold, premium streetwear graphic inspired by the theme of "${prompt}" — the PRIMARY design for the front of a ${frontColor} ${frontProduct}. Make it a strong, dominant, visually striking focal design with premium streetwear quality.

IMPORTANT:
- generate ONLY the artwork/graphic design itself — do NOT generate any t-shirt, clothing, mockup, or background scene
- centered composition, premium streetwear aesthetic
- transparent background with only the graphic artwork visible
- ABSOLUTELY NO text, words, letters, numbers, or labels of any kind
- ABSOLUTELY NO t-shirt, clothing, garment, or mockup in the image
- print-ready isolated graphic only
${doubleReferenceInstruction}
`;


        // =====================================
        // BACK DESIGN — different style entirely
        // =====================================

        const backFinalPrompt = `
Create a bold, premium streetwear graphic inspired by the theme of "${prompt}" but rendered in a COMPLETELY DIFFERENT artistic style — for example, if the front is illustrative, make this one geometric or abstract. If the front is detailed, make this one minimal and bold. Different composition, different visual approach, different focal elements, while sharing the same core theme.

IMPORTANT:
- generate ONLY the artwork/graphic design itself — do NOT generate any t-shirt, clothing, mockup, or background scene
- this MUST be a visually distinct design from the front — different art style, different layout, different focal point
- centered composition, premium streetwear aesthetic
- transparent background with only the graphic artwork visible
- ABSOLUTELY NO text, words, letters, numbers, or labels of any kind
- ABSOLUTELY NO t-shirt, clothing, garment, or mockup in the image
- print-ready isolated graphic only
${doubleReferenceInstruction}
`;


        // =====================================
        // GENERATE BOTH IN PARALLEL + RETRY
        // =====================================

        console.log(
          "GENERATING BOTH DESIGNS IN PARALLEL..."
        );

        const [frontResult, backResult] =
          await Promise.all([
            generateImageWithRetry(
              frontFinalPrompt,
              imageParts
            ),
            generateImageWithRetry(
              backFinalPrompt,
              imageParts
            )
          ]);

        const frontImage =
          frontResult
          || await createFallbackSingleImage(
            preferences,
            prompt,
            "front"
          );

        const backImage =
          backResult
          || await createFallbackSingleImage(
            preferences,
            prompt,
            "back"
          );


        console.log(
          "FRONT AND BACK DESIGNS GENERATED"
        );


        await consumeQuota(user);

        return res.json({

          success: true,

          frontImage,

          backImage,

          preferences,

          enrichedPrompt:
            "Front and back generated as separate designs",

          quota:
            getQuotaSummary(user)
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


const fallbackCoupleImage =
  req.files && req.files.length > 0
    ? await createReferenceFallbackCouple(
        req.files,
        preferences,
        prompt
      )
    : await createFallbackCoupleImage(
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


await consumeQuota(user);

return res.json({

  success: true,

  hisImage:
    leftImage,

  herImage:
    rightImage,

  preferences,

  enrichedPrompt:
    enhancedPrompt,

  quota:
    getQuotaSummary(user)
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
