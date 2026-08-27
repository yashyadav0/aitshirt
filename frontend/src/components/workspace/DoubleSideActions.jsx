import React, {
  useState
} from "react";

import {
  Heart
} from "lucide-react";

import { getPricingKey } from "../../config/pricing";


// =====================================
// ROBUST IMAGE LOADER
// =====================================

const loadImage = (
  src
) =>
  new Promise(
    (resolve, reject) => {
      const img =
        new Image();

      img.crossOrigin =
        "anonymous";

      img.onload =
        () => resolve(img);

      img.onerror =
        () =>
          reject(
            new Error(
              "Could not load image"
            )
          );

      img.src = src;
    }
  );


export default function DoubleSideActions({

  generatedFrontImage,

  generatedBackImage,

  prompt,

  selectedColor,

  getMockup,

  productType,

  frontTransform,

  backTransform,

  confirmedDesign,

  setConfirmedDesign,

  isConfirmed,

  setIsConfirmed,

  API,

  setSuccessMessage,

  generationPreferences

}) {

  // =====================================
  // SIZE
  // =====================================

  const [selectedSize,
    setSelectedSize] =
    useState("M");


  const sizes = [

    "S",
    "M",
    "L"
  ];


  const designScale = 45;


  // =====================================
  // SUCCESS TOAST
  // =====================================

  const showToast = (
    message
  ) => {

    setSuccessMessage(
      message
    );

    setTimeout(() => {

      setSuccessMessage("");

    }, 2500);
  };


  // =====================================
  // COMPOSITE ONE SIDE
  // =====================================

  const compositeSide = async (
    side,
    artworkImage
  ) => {

    const transform =
      side === "front" ? frontTransform : backTransform;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = 800;
    canvas.height = 800;

    const ctx =
      canvas.getContext("2d");


    const [mockupImg, designImg] =
      await Promise.all([

        loadImage(
          getMockup(
            productType,
            selectedColor,
            side
          )
        ),

        loadImage(
          artworkImage
        )
      ]);


    // DRAW MOCKUP

    ctx.drawImage(

      mockupImg,

      -60,
      -120,

      920,
      1040
    );


    // DESIGN — use customer transform (percentages of canvas)

    const canvasScale = 800 / 920;

    // Match preview defaults per product type
    const designStyles = {
      tshirt: { top: "50%", width: "48%" },
      hoodie: { top: "42%", width: "27%" },
      oversized: { top: "42%", width: "55%" },
      kids: { top: "42%", width: "40%" }
    };
    const defaultStyle = designStyles[productType] || designStyles.tshirt;
    const defaultWidthPct = parseFloat(defaultStyle.width.replace("%", ""));
    const defaultY = parseFloat(defaultStyle.top.replace("%", ""));

    const widthPct = transform?.widthPct ?? defaultWidthPct;

    const designWidth = (widthPct / 100) * canvas.width;
    const designHeight = designWidth;

    const defaultX = 50;
    const centerX = transform?.x ?? defaultX;
    const centerY = transform?.y ?? defaultY;
    const rotation = transform?.rotation ?? 0;

    const drawX = centerX / 100 * canvas.width - designWidth / 2;
    const drawY = centerY / 100 * canvas.height - designHeight / 2;


    // DRAW DESIGN with rotation

    ctx.save();
    ctx.translate(drawX + designWidth / 2, drawY + designHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      designImg,
      -designWidth / 2,
      -designHeight / 2,
      designWidth,
      designHeight
    );
    ctx.restore();


    // EXPORT PNG

    const finalMockupBlob =
      await new Promise(

        (resolve) =>

          canvas.toBlob(
            resolve,
            "image/png"
          )
      );


    // UPLOAD FINAL MOCKUP

    const token =
      localStorage.getItem(
        "token"
      );

    const formData =
      new FormData();

    formData.append(
      "image",
      finalMockupBlob
    );


    const uploadRes =
      await API.post(

        "/upload",

        formData,

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "multipart/form-data"
          }
        }
      );


    return uploadRes.data.imageUrl;
  };


  // =====================================
  // CONFIRM DESIGN
  // =====================================

  const handleConfirmDesign =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        // =====================================
        // COMPOSITE FRONT + BACK
        // =====================================

        const frontDesignImage =
          await compositeSide(
            "front",
            generatedFrontImage
          );

        const backDesignImage =
          await compositeSide(
            "back",
            generatedBackImage
          );


        // =====================================
        // SAVE DATA
        // =====================================

        const designData = {

          generationMode:
            "double",

          preferences:
            generationPreferences || {
              productType,
              designType: "double",
              selectedColor,
              color: selectedColor
            },

          productType:
            generationPreferences?.productType
            || productType,

          designType:
            generationPreferences?.designType
            || "double",

          frontDesignImage,

          backDesignImage,

          frontTransparentDesign:
            generatedFrontImage,

          backTransparentDesign:
            generatedBackImage,

          prompt,

          selectedColor:
            generationPreferences?.selectedColor
            || generationPreferences?.color
            || selectedColor,

          color:
            generationPreferences?.selectedColor
            || generationPreferences?.color
            || selectedColor,

          shirtColor:
            generationPreferences?.selectedColor
            || generationPreferences?.color
            || selectedColor,

          size:
            selectedSize,

          side:
            "both",

          designScale:

            designScale,

          frontTransform:

            frontTransform,

          backTransform:

            backTransform,

          isConfirmed:
            true
        };


        // =====================================
        // SAVE HISTORY
        // =====================================

        await API.post(

          "/generation/save",

          designData,

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        setConfirmedDesign(
          designData
        );

        setIsConfirmed(true);

        showToast(
          "Design Confirmed"
        );

      } catch (err) {

        console.log(err);

        showToast(
          err?.message
          || "Could not confirm design — please try again"
        );
      }
    };


  // =====================================
  // ADD TO CART
  // =====================================

  const handleAddToCart =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        // Determine pricing key based on product type and design type (double)
        const pricingKey = getPricingKey(productType, "double");


        await API.post(

          "/cart/add",

          {

            pricingKey,

            isCouple:
              false,

            isDoubleSide:
              true,

            frontDesignImage:
              confirmedDesign.frontDesignImage,

            backDesignImage:
              confirmedDesign.backDesignImage,

            frontTransparentDesign:
              confirmedDesign.frontTransparentDesign,

            backTransparentDesign:
              confirmedDesign.backTransparentDesign,

            prompt:
              confirmedDesign.prompt,

            color:
              confirmedDesign.color,

            selectedColor:
              confirmedDesign.selectedColor,

            size:
              confirmedDesign.size,

            side:
              confirmedDesign.side,

            designScale:
              confirmedDesign.designScale,

            frontTransform:
              confirmedDesign.frontTransform,

            backTransform:
              confirmedDesign.backTransform
          },

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        showToast(
          "Added To Cart"
        );

      } catch (err) {

        console.log(err);
      }
    };


  // =====================================
  // ADD TO WISHLIST
  // =====================================

  const handleWishlist =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        await API.post(

          "/wishlist/add",

          {

            designImage:
              confirmedDesign.frontDesignImage,

            transparentDesign:
              confirmedDesign.frontTransparentDesign,

            frontDesignImage:
              confirmedDesign.frontDesignImage,

            backDesignImage:
              confirmedDesign.backDesignImage,

            frontTransparentDesign:
              confirmedDesign.frontTransparentDesign,

            backTransparentDesign:
              confirmedDesign.backTransparentDesign,

            prompt:
              confirmedDesign.prompt,

            color:
              confirmedDesign.color,

            selectedColor:
              confirmedDesign.selectedColor,

            size:
              confirmedDesign.size,

            designScale:
              confirmedDesign.designScale,

            frontTransform:
              confirmedDesign.frontTransform,

            backTransform:
              confirmedDesign.backTransform
          },

          {
            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


        showToast(
          "Added To Wishlist"
        );

      } catch (err) {

        console.log(err);
      }
    };


  return (

    <>

      {/* SIZE */}

      <div
        className="
          mt-4
          sm:mt-6
        "
      >

        <p
          className="
            text-white
            font-semibold
            mb-2
            sm:mb-3
            text-sm
            sm:text-base
          "
        >

          Select Size

        </p>


        <div
          className="
            flex
            gap-2
            sm:gap-3
          "
        >

          {
            sizes.map(
              (size) => (

                <button

                  key={size}

                  onClick={() =>
                    setSelectedSize(
                      size
                    )
                  }

                  className={`...
                    flex-1
                    min-h-12
                    py-2
                    sm:py-3
                    rounded-lg
                    sm:rounded-[18px]
                    border
                    transition-all
                    text-sm
                    sm:text-base
                    font-medium

                    ${
                      selectedSize === size

                        ? `
                          bg-cyan-500
                          border-cyan-500
                          text-white
                        `

                        : `
                          border-white/20
                          text-white
                          hover:border-white/40
                        `
                    }
                  `}
                >

                  {size}

                </button>
              )
            )
          }

        </div>

      </div>


      {/* CONFIRM */}

      <button

        onClick={
          handleConfirmDesign
        }

        disabled={
          isConfirmed
        }

        className="
          w-full
          mt-6
          bg-green-500
          hover:bg-green-600
          transition
          text-white
          py-4
          rounded-[24px]
          font-bold
          text-lg
          disabled:opacity-50
        "
      >

        {
          isConfirmed

            ? "Design Confirmed"

            : "Confirm Design"
        }

      </button>


      {/* ACTIONS */}

      <div
        className="
          flex
          gap-4
          mt-4
        "
      >

        {/* CART */}

        <button

          onClick={
            handleAddToCart
          }

          disabled={
            !isConfirmed
          }

          className="
            flex-1
            bg-cyan-500
            py-4
            rounded-[24px]
            font-bold
            disabled:opacity-50
          "
        >

          Add To Cart

        </button>


        {/* WISHLIST */}

        <button

          onClick={
            handleWishlist
          }

          disabled={
            !isConfirmed
          }

          className="
            w-20
            border
            border-white/20
            rounded-[24px]
            flex
            items-center
            justify-center
            disabled:opacity-50
          "
        >

          <Heart size={28} />

        </button>

      </div>

    </>
  );
}