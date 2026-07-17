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

const REFERENCE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);


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
    },

    fileFilter: (req, file, callback) => {
      if (!REFERENCE_IMAGE_TYPES.has(file.mimetype)) {
        callback(new Error("Reference images must be PNG, JPG, or WebP files."));
        return;
      }
      callback(null, true);
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

async function enhanceDoublePrompt(userPrompt) {
  const fallback = {
    frontPrompt: `Minimal, premium front apparel print based on ${userPrompt}. Centered composition with matching typography.`,
    backPrompt: `Detailed, premium back apparel print expanding ${userPrompt}. Centered composition with matching typography.`
  };

  try {
    const enhancerPrompt = `You are an elite AI fashion prompt engineer. Turn one apparel idea into two complementary, visually consistent print prompts for the FRONT and BACK of the SAME garment.

Rules:
- front is a clear, premium centered front print; back expands the same concept
- preserve one art style, palette, typography language, and subject
- each prompt must be independently renderable and under 70 words
- isolated artwork, transparent background, no mockup, no garment, no watermark, print-ready

User Prompt: ${userPrompt}

Return ONLY valid JSON: {"frontPrompt":"...","backPrompt":"..."}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: enhancerPrompt }] }] },
      { timeout: 30000 }
    );
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const json = JSON.parse((text || "").replace(/^```json\s*|\s*```$/g, ""));
    if (!json.frontPrompt || !json.backPrompt) throw new Error("Enhancer returned incomplete double-side prompts.");
    return { frontPrompt: json.frontPrompt.trim(), backPrompt: json.backPrompt.trim() };
  } catch (err) {
    console.log("DOUBLE PROMPT ENHANCER ERROR:", err.response?.data || err.message);
    return fallback;
  }
}

const PRINT_QUALITY_BRIEF = `
Professional premium t-shirt graphic. Large centered composition for a modern
oversized graphic tee. Print-ready artwork, highly detailed, bold graphic
design, clean vector-inspired illustration, high contrast, vibrant colors,
sharp edges, isolated subject, transparent background. Generate only the
printable artwork; do not generate clothing, hoodies, t-shirts, mannequins,
mockups, garment flat-lays, people wearing clothing, or a background scene.
No watermark. No logo-sized chest placement. No split composition.`;

// =====================================
// IMAGE GENERATION
// =====================================

const generationDebug = (...args) => {
  if (process.env.GENERATION_DEBUG !== "false") {
    console.debug("[generation-debug]", ...args);
  }
};

function asImageDataUri(value, mimeType = "image/png") {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim();
  if (/^data:image\//i.test(normalized) || /^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  if (/^[A-Za-z0-9+/\r\n]+={0,2}$/.test(normalized)) {
    return `data:${mimeType};base64,${normalized.replace(/\s/g, "")}`;
  }
  return null;
}

function extractGeneratedImage(payload, trail = "response", visited = new Set()) {
  if (payload == null || typeof payload === "boolean") return null;

  if (typeof payload === "string") {
    const image = asImageDataUri(payload);
    if (image) return { image, trail };
    try {
      return extractGeneratedImage(JSON.parse(payload), `${trail}.json`, visited);
    } catch {
      return null;
    }
  }

  if (typeof payload !== "object" || visited.has(payload)) return null;
  visited.add(payload);

  const mimeType = payload.mimeType || payload.mime_type || payload.contentType || "image/png";
  const directFields = ["inlineData", "image", "b64_json", "base64", "imageBase64", "image_url", "imageUrl", "url", "uri", "fileUri", "file_uri", "data"];

  for (const field of directFields) {
    const value = payload[field];
    if (typeof value === "string") {
      const image = asImageDataUri(value, mimeType);
      if (image) return { image, trail: `${trail}.${field}` };
    }
    if (value && typeof value === "object") {
      const nested = extractGeneratedImage(value, `${trail}.${field}`, visited);
      if (nested) return nested;
    }
  }

  // These cover Gemini, OpenAI-compatible, prediction, and wrapper responses.
  const containers = ["generatedImages", "images", "output", "data", "candidates", "predictions", "content", "parts", "results"];
  for (const field of containers) {
    const value = payload[field];
    const entries = Array.isArray(value) ? value : [value];
    for (let index = 0; index < entries.length; index += 1) {
      const nested = extractGeneratedImage(entries[index], `${trail}.${field}[${index}]`, visited);
      if (nested) return nested;
    }
  }

  return null;
}

async function validateGeneratedArtwork(image, label) {
  if (typeof image !== "string" || !image.trim()) {
    throw new Error(`${label} generation returned no image data.`);
  }

  let buffer;
  let mimeType;

  if (/^https?:\/\//i.test(image)) {
    try {
      const response = await axios.get(image, {
        responseType: "arraybuffer",
        timeout: 30000
      });
      buffer = Buffer.from(response.data);
      mimeType = response.headers["content-type"]?.split(";")[0] || "image/png";
    } catch (error) {
      throw new Error(`${label} generation returned an image URL that could not be downloaded: ${error.message}`);
    }
  } else {
    const dataUriMatch = image.match(/^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i);
    if (!dataUriMatch) {
      throw new Error(`${label} generation returned an unsupported image format.`);
    }

    buffer = Buffer.from(dataUriMatch[2].replace(/\s/g, ""), "base64");
    mimeType = dataUriMatch[1];
  }

  if (!buffer.length) {
    throw new Error(`${label} generation returned empty image bytes.`);
  }

  const metadata = await sharp(buffer).metadata();
  if (!metadata.format || !metadata.width || !metadata.height) {
    throw new Error(`${label} generation returned bytes that are not a readable image.`);
  }

  generationDebug(`${label} artwork validated`, {
    mimeType,
    format: metadata.format,
    width: metadata.width,
    height: metadata.height
  });

  return {
    url: image,
    buffer,
    width: metadata.width,
    height: metadata.height,
    mimeType
  };
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function isTransientGenerationError(error) {
  const status = error.response?.status;
  return (
    !status
    || status === 408
    || status === 429
    || status >= 500
    || ["ECONNABORTED", "ETIMEDOUT", "ECONNRESET"].includes(error.code)
  );
}

async function postGeminiWithRetry(url, payload, config) {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await axios.post(url, payload, config);
    } catch (error) {
      lastError = error;
      const retry = attempt < maxAttempts && isTransientGenerationError(error);
      generationDebug("Gemini request failed", {
        attempt,
        retry,
        status: error.response?.status,
        code: error.code,
        message: error.message
      });
      if (!retry) break;
      await wait(600 * attempt);
    }
  }

  throw lastError;
}

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
      await postGeminiWithRetry(

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

          timeout: 75000,

          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );


    console.log("[1] Gemini response received");
    console.dir(response.data, { depth: null, maxArrayLength: null });
    generationDebug("raw image API response", response.data);
    generationDebug("parsed image API response", JSON.stringify(response.data));

    const extracted = extractGeneratedImage(response.data);
    generationDebug("candidate image extraction", extracted || "none");

    if (!extracted?.image) {
      throw new Error(`Gemini response parsing failed at image extraction: no supported image source found. Top-level fields: ${Object.keys(response.data || {}).join(", ") || "none"}.`);
    }

    generationDebug("selected artwork URL", extracted.image.slice(0, 96), "from", extracted.trail);
    generationDebug("artwork URL validation", /^data:image\//i.test(extracted.image) || /^https?:\/\//i.test(extracted.image));
    console.log("[2] Image extracted", {
      source: extracted.trail,
      mimeType: extracted.image.match(/^data:(image\/[^;]+)/i)?.[1] || "remote-url",
      valueLength: extracted.image.length
    });
    return extracted.image;

  } catch (err) {

    console.error("IMAGE GENERATION ERROR", {
      stage: "Gemini request / response parsing",
      message: err.message,
      received: err.response?.data || null,
      stack: err.stack
    });
    generationDebug("image parsing failure", err.stack || err.message);

    return null;
  }
}

// =====================================
// SPLIT IMAGE
// =====================================

async function splitImage(imageSource) {

  try {

    let imageBuffer;
    if (Buffer.isBuffer(imageSource)) {
      imageBuffer = imageSource;
    } else if (typeof imageSource === "string" && /^https?:\/\//i.test(imageSource)) {
      const response = await axios.get(imageSource, {
        responseType: "arraybuffer",
        timeout: 30000
      });
      imageBuffer = Buffer.from(response.data);
    } else if (typeof imageSource === "string") {
      const match = imageSource.match(/^data:image\/[a-z0-9.+-]+;base64,([A-Za-z0-9+/=\s]+)$/i);
      if (!match) {
        throw new Error("Split stage received an unsupported image source.");
      }
      imageBuffer = Buffer.from(match[1].replace(/\s/g, ""), "base64");
    } else {
      throw new Error("Split stage received no image data.");
    }


    if (!imageBuffer.length) {
      throw new Error("Split stage received an empty image buffer.");
    }

    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height || metadata.width < 2) {
      throw new Error(`Split stage received invalid image dimensions: ${metadata.width || 0}x${metadata.height || 0}.`);
    }

    const leftWidth = Math.floor(metadata.width / 2);
    const rightWidth = metadata.width - leftWidth;
    console.log("[3] Image metadata", {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      leftWidth,
      rightWidth
    });


    // =====================================
    // LEFT IMAGE
    // =====================================

    const leftBuffer =
      await sharp(imageBuffer)

        .extract({

          left: 0,

          top: 0,

          width: leftWidth,

          height: metadata.height
        })

        .png()

        .toBuffer();


    // =====================================
    // RIGHT IMAGE
    // =====================================

    const rightBuffer =
      await sharp(imageBuffer)

        .extract({

          left: leftWidth,

          top: 0,

          width: rightWidth,

          height: metadata.height
        })

        .png()

        .toBuffer();


    console.log("[4] Split complete", {
      width: metadata.width,
      height: metadata.height,
      leftBufferSize: leftBuffer.length,
      rightBufferSize: rightBuffer.length
    });

    return {

      width: metadata.width,
      height: metadata.height,
      leftWidth,
      rightWidth,

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

      if (!String(prompt || "").trim()) {
        return res.status(400).json({
          success: false,
          error: "A design prompt is required before artwork can be generated."
        });
      }


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

${PRINT_QUALITY_BRIEF}

IMPORTANT:

- isolated artwork only
- transparent background
- apparel graphic only
- premium streetwear aesthetic
        - optimized for ${preferences.selectedColor} ${preferences.productType}
- no mockup
- no tshirt
- no hoodie
- no mannequin
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

        const sharedPrompt = String(prompt || "").trim();

        if (!sharedPrompt) {
          return res.status(400).json({
            error: "A design prompt is required for the double-side set."
          });
        }

        const { frontPrompt, backPrompt } = await enhanceDoublePrompt(
          buildPreferenceEnrichedPrompt(sharedPrompt, preferences)
        );
        const referenceInstruction = imageParts.length
          ? "\nUse uploaded images only as visual references; never return the source image."
          : "";
        const printInstructions = `${PRINT_QUALITY_BRIEF}\nCreate one centered, oversized apparel print.${referenceInstruction}`;

        // These are deliberately independent requests. Double Side never
        // creates a combined canvas and never uses the couple split pipeline.
        const [frontImage, backImage] = await Promise.all([
          generateImage(`${frontPrompt}\n${printInstructions}`, imageParts),
          generateImage(`${backPrompt}\n${printInstructions}`, imageParts)
        ]);
        const [fallbackFront, fallbackBack] = await Promise.all([
          frontImage ? Promise.resolve(frontImage) : createFallbackSingleImage(preferences, frontPrompt),
          backImage ? Promise.resolve(backImage) : createFallbackSingleImage(preferences, backPrompt)
        ]);

        return res.json({
          success: true,
          frontImage: fallbackFront,
          backImage: fallbackBack,
          frontPrompt,
          backPrompt,
          preferences
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
- no hoodie
- no mannequin
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

      console.error("GENERATION ERROR:", {
        stage: "generation route",
        message: err.message,
        apiResponse: err.response?.data || null,
        stack: err.stack
      });


      return res.status(500)
        .json({

          success: false,

          error: "Generation failed while preparing artwork.",
          details: err.message
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
