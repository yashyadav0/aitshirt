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

/**
 * Download both the transparent design AND the mockup (design on t-shirt) at 4K resolution
 * @param {string} designUrl - URL of the transparent design PNG
 * @param {string} mockupUrl - URL of the t-shirt mockup base image
 * @param {object} transform - Transform object with x, y, widthPct, rotation
 * @param {string} productType - Product type (tshirt, hoodie, oversized, kids)
 * @param {string} fileName - Base filename for downloads
 */
export async function downloadDesignAndMockup4K(
  designUrl,
  mockupUrl,
  transform,
  productType,
  fileName = "design"
) {
  try {
    // Load both images
    const [designBlob, mockupBlob] = await Promise.all([
      fetch(designUrl).then(r => r.blob()),
      fetch(mockupUrl).then(r => r.blob())
    ]);

    const designLocalUrl = URL.createObjectURL(designBlob);
    const mockupLocalUrl = URL.createObjectURL(mockupBlob);

    const [designImg, mockupImg] = await Promise.all([
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = designLocalUrl;
      }),
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = mockupLocalUrl;
      })
    ]);

    // =====================================
    // 1. DOWNLOAD TRANSPARENT DESIGN AT 4K
    // =====================================
    const designCanvas = document.createElement("canvas");
    designCanvas.width = 4096;
    designCanvas.height = 4096;
    const designCtx = designCanvas.getContext("2d");
    designCtx.clearRect(0, 0, 4096, 4096);
    designCtx.drawImage(designImg, 0, 0, 4096, 4096);

    const designBlob4K = await new Promise(resolve =>
      designCanvas.toBlob(resolve, "image/png")
    );

    const designDownloadUrl = URL.createObjectURL(designBlob4K);
    const designLink = document.createElement("a");
    designLink.href = designDownloadUrl;
    designLink.download = `${fileName}-design-4k.png`;
    designLink.click();

    // =====================================
    // 2. CREATE AND DOWNLOAD MOCKUP AT 4K
    // =====================================
    const mockupCanvas = document.createElement("canvas");
    mockupCanvas.width = 4096;
    mockupCanvas.height = 4096;
    const mockupCtx = mockupCanvas.getContext("2d");

    // Draw mockup base (scaled to fill canvas similar to 800x800 version)
    // The 800x800 canvas draws mockup at -60,-120 with 920x1040
    // Scale factor: 4096/800 = 5.12
    const scale = 4096 / 800;
    mockupCtx.drawImage(
      mockupImg,
      -60 * scale,
      -120 * scale,
      920 * scale,
      1040 * scale
    );

    // Draw design on top with transform
    const designStyles = {
      tshirt: { top: "50%", width: "48%" },
      hoodie: { top: "42%", width: "27%" },
      oversized: { top: "42%", width: "55%" },
      kids: { top: "44%", width: "34%" }
    };
    const defaultStyle = designStyles[productType] || designStyles.tshirt;
    const defaultWidthPct = parseFloat(defaultStyle.width.replace("%", ""));
    const widthPct = transform?.widthPct ?? defaultWidthPct;

    const designWidth = (widthPct / 100) * mockupCanvas.width;
    const designHeight = designWidth;

    const defaultX = 50;
    const defaultY = parseFloat(defaultStyle.top.replace("%", ""));
    const centerX = transform?.x ?? defaultX;
    const centerY = transform?.y ?? defaultY;
    const rotation = transform?.rotation ?? 0;

    const x = centerX / 100 * mockupCanvas.width - designWidth / 2;
    const y = centerY / 100 * mockupCanvas.height - designHeight / 2;

    mockupCtx.save();
    mockupCtx.translate(x + designWidth / 2, y + designHeight / 2);
    mockupCtx.rotate((rotation * Math.PI) / 180);
    mockupCtx.drawImage(
      designImg,
      -designWidth / 2,
      -designHeight / 2,
      designWidth,
      designHeight
    );
    mockupCtx.restore();

    const mockupBlob4K = await new Promise(resolve =>
      mockupCanvas.toBlob(resolve, "image/png")
    );

    const mockupDownloadUrl = URL.createObjectURL(mockupBlob4K);
    const mockupLink = document.createElement("a");
    mockupLink.href = mockupDownloadUrl;
    mockupLink.download = `${fileName}-mockup-4k.png`;
    mockupLink.click();

    // Cleanup
    URL.revokeObjectURL(designLocalUrl);
    URL.revokeObjectURL(mockupLocalUrl);
    URL.revokeObjectURL(designDownloadUrl);
    URL.revokeObjectURL(mockupDownloadUrl);

    return true;
  } catch (err) {
    console.log("DOWNLOAD DESIGN AND MOCKUP 4K ERROR:", err);
    return false;
  }
}