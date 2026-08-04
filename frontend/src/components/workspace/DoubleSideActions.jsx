import React, {
  useState
} from "react";

import {
  Heart
} from "lucide-react";


export default function DoubleSideActions({

  generatedFrontImage,

  generatedBackImage,

  prompt,

  selectedColor,

  getMockup,

  productType,

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

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = 800;
    canvas.height = 800;

    const ctx =
      canvas.getContext("2d");


    // MOCKUP IMAGE

    const mockupImage =
      new Image();

    mockupImage.crossOrigin =
      "anonymous";

    mockupImage.src =
      getMockup(
        productType,
        selectedColor,
        side
      );


    // DESIGN IMAGE

    const designImage =
      new Image();

    designImage.crossOrigin =
      "anonymous";

    designImage.src =
      artworkImage;


    await Promise.all([

      new Promise(
        (resolve) =>
          mockupImage.onload =
            resolve
      ),

      new Promise(
        (resolve) =>
          designImage.onload =
            resolve
      )
    ]);


    // DRAW MOCKUP

    ctx.drawImage(

      mockupImage,

      -60,
      -120,

      920,
      1040
    );


    // DESIGN SIZE

    const designWidth =
      390 *
      (designScale / 45);

    const designHeight =
      designWidth;


    // DESIGN POSITION

    const x =
      (canvas.width - designWidth) / 2;

    const y =
      side === "front"
        ? 170
        : 190;


    // DRAW DESIGN

    ctx.drawImage(

      designImage,

      x,
      y,

      designWidth,
      designHeight
    );


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


        await API.post(

          "/cart/add",

          {

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

            price:
              899
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
              confirmedDesign.designScale
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

                  className={`
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
