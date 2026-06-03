export async function upscaleImage(

  imageUrl,
  fileName = "design"

) {

  try {

    // =====================================
    // FETCH IMAGE
    // =====================================

    const response =
      await fetch(imageUrl);

    const blob =
      await response.blob();


    // =====================================
    // LOCAL URL
    // =====================================

    const localUrl =
      URL.createObjectURL(
        blob
      );


    // =====================================
    // LOAD IMAGE
    // =====================================

    const image =
      new Image();

    image.src =
      localUrl;


    await new Promise(

      (resolve, reject) => {

        image.onload =
          resolve;

        image.onerror =
          reject;
      }
    );


    // =====================================
    // 4K CANVAS
    // =====================================

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      4096;

    canvas.height =
      4096;


    const ctx =
      canvas.getContext(
        "2d"
      );


    // =====================================
    // DRAW IMAGE
    // =====================================

    ctx.clearRect(
      0,
      0,
      4096,
      4096
    );


    ctx.drawImage(

      image,

      0,
      0,

      4096,
      4096
    );


    // =====================================
    // EXPORT
    // =====================================

    const finalBlob =
      await new Promise(

        (resolve) =>

          canvas.toBlob(

            resolve,

            "image/png"
          )
      );


    // =====================================
    // DOWNLOAD
    // =====================================

    const downloadUrl =
      URL.createObjectURL(
        finalBlob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href =
      downloadUrl;

    link.download =
      `${fileName}-4k.png`;

    link.click();


    // =====================================
    // CLEANUP
    // =====================================

    URL.revokeObjectURL(
      localUrl
    );

    URL.revokeObjectURL(
      downloadUrl
    );


    return true;

  } catch (err) {

    console.log(
      "UPSCALE ERROR:",
      err
    );

    return false;
  }
}