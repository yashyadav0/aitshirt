const axios =
  require("axios");

const fs =
  require("fs");

const path =
  require("path");


// 🎨 AI Generator
async function generateImage(

  prompt,

  referenceImageUrl = ""

) {

  try {

    console.log(
      "AI GENERATION STARTED"
    );


    // ✅ Parts array
    const parts = [];


    // 📝 Prompt
    parts.push({

      text: prompt
    });


    // 🖼️ Reference image
    if (
      referenceImageUrl
    ) {

      const imageResponse =

        await axios.get(

          referenceImageUrl,

          {
            responseType:
              "arraybuffer"
          }
        );


      const base64Image =

        Buffer.from(

          imageResponse.data

        ).toString(
          "base64"
        );


      parts.push({

        inlineData: {

          mimeType:
            "image/png",

          data:
            base64Image
        }
      });
    }


    const response =

      await axios.post(

        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,

        {

          contents: [

            {
              parts
            }
          ],

          generationConfig: {

            responseModalities: [
              "TEXT",
              "IMAGE"
            ],

            temperature: 0.4,

            maxOutputTokens: 256
          }
        },

        {
          timeout:
            1000 * 180
        }
      );


    console.log(
      "GEMINI RESPONSE RECEIVED"
    );


    const candidate =

      response.data
        .candidates?.[0];


    if (!candidate) {

      console.log(
        response.data
      );

      throw new Error(
        "No candidate returned"
      );
    }


    const responseParts =

      candidate.content?.parts;


    if (!responseParts) {

      console.log(
        response.data
      );

      throw new Error(
        "No response parts"
      );
    }


    for (
      const part
      of responseParts
    ) {

      if (
        part.inlineData
      ) {

        const imageData =
          part.inlineData.data;


        const uploadsDir =

          path.join(

            __dirname,

            "../uploads"
          );


        if (
          !fs.existsSync(
            uploadsDir
          )
        ) {

          fs.mkdirSync(
            uploadsDir
          );
        }


        const fileName =

          `design-${Date.now()}.png`;


        const filePath =

          path.join(

            uploadsDir,

            fileName
          );


        fs.writeFileSync(

          filePath,

          Buffer.from(
            imageData,
            "base64"
          )
        );


        console.log(
          "DESIGN SAVED:",
          filePath
        );


        return filePath;
      }
    }


    console.log(
      response.data
    );

    throw new Error(
      "No image returned"
    );

  } catch (err) {

    console.log(

      "GEMINI ERROR:",

      err.response?.data ||

      err.message
    );

    throw err;
  }
}


module.exports = {
  generateImage
};