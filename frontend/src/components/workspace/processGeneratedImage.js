import {
  removeBackground
} from "@imgly/background-removal";

import API from "../../api";


// =====================================
// PROCESS GENERATED IMAGE
// =====================================

export default async function processGeneratedImage(

  imageUrl,

  token

) {

  try {

    console.log(
      "STARTING BACKGROUND REMOVAL..."
    );


    // =====================================
    // FETCH IMAGE
    // =====================================

    const imageBlob =
      await fetch(
        imageUrl
      ).then((r) =>
        r.blob()
      );


    // =====================================
    // REMOVE BACKGROUND
    // =====================================

    const transparentResult =

      await removeBackground(
        imageBlob
      );


    const transparentBlob =

      transparentResult instanceof Blob

        ? transparentResult

        : new Blob(
            [transparentResult],
            {
              type:
                "image/png"
            }
          );


    console.log(
      "BACKGROUND REMOVED"
    );


    // =====================================
    // UPLOAD CLEAN PNG
    // =====================================

    const formData =
      new FormData();

    formData.append(
      "image",
      transparentBlob
    );


    const uploadRes =
      await API.post(

        "/upload",

        formData,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


    console.log(
      "CLEAN PNG UPLOADED"
    );


    // =====================================
    // RETURN CLEAN URL
    // =====================================

    return uploadRes
      .data
      .imageUrl;

  } catch (err) {

    console.log(
      "PROCESS GENERATED IMAGE ERROR:"
    );

    console.log(err);


    // =====================================
    // FALLBACK
    // =====================================

    return imageUrl;
  }
}
