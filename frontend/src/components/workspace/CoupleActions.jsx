import React from "react";

import {
  Heart
} from "lucide-react";


export default function CoupleActions({

  generatedHisImage,
  generatedHerImage,

  couplePrompt,

  hisColor,
  herColor,

  hisSide,
  herSide,

  hisScale,
  herScale,

  API,

  getMockup,

  setSuccessMessage,

  confirmedDesign,
  setConfirmedDesign,

  isConfirmed,
  setIsConfirmed

}) {

  // =====================================
  // TOAST
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
  // CREATE FINAL MOCKUP
  // =====================================

  const createFinalMockup =
    async (

      mockupSrc,
      designSrc,
      scale,
      side

    ) => {

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = 800;
      canvas.height = 800;

      const ctx =
        canvas.getContext("2d");


      // MOCKUP

      const mockupImage =
        new Image();

      mockupImage.crossOrigin =
        "anonymous";

      mockupImage.src =
        mockupSrc;


      // DESIGN

      const designImage =
        new Image();

      designImage.crossOrigin =
        "anonymous";

      designImage.src =
        designSrc;


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


      // SIZE

      const designWidth =
        390 *
        (scale / 45);

      const designHeight =
        designWidth;


      // POSITION

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


      // EXPORT

      return await new Promise(

        (resolve) =>

          canvas.toBlob(
            resolve,
            "image/png"
          )
      );
    };


  // =====================================
  // UPLOAD IMAGE
  // =====================================

  const uploadImage =
    async (
      blob,
      token
    ) => {

      const formData =
        new FormData();

      formData.append(
        "image",
        blob
      );


      const res =
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


      return res.data.imageUrl;
    };


  // =====================================
  // CONFIRM
  // =====================================

  const handleConfirm =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );


        // =====================================
        // HIS FINAL MOCKUP
        // =====================================

        const hisBlob =
          await createFinalMockup(

            getMockup(
              hisColor,
              hisSide
            ),

            generatedHisImage,

            hisScale,

            hisSide
          );


        const hisFinalImage =
          await uploadImage(
            hisBlob,
            token
          );


        // =====================================
        // HER FINAL MOCKUP
        // =====================================

        const herBlob =
          await createFinalMockup(

            getMockup(
              herColor,
              herSide
            ),

            generatedHerImage,

            herScale,

            herSide
          );


        const herFinalImage =
          await uploadImage(
            herBlob,
            token
          );


        // =====================================
        // SAVE DATA
        // =====================================

        const designData = {

          isCouple: true,

          // FINAL MOCKUPS

          hisDesignImage:
            hisFinalImage,

          herDesignImage:
            herFinalImage,

          // TRANSPARENT PNGS

          hisDesign:
            generatedHisImage,

          herDesign:
            generatedHerImage,

          // PROMPT

          couplePrompt,

          // INFO

          hisColor,
          herColor,

          hisSide,
          herSide,

          hisScale,
          herScale,

          price: 1299
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
          "Couple Design Confirmed"
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

            isCouple: true,

            hisDesignImage:
              confirmedDesign.hisDesignImage,

            herDesignImage:
              confirmedDesign.herDesignImage,

            hisDesign:
              confirmedDesign.hisDesign,

            herDesign:
              confirmedDesign.herDesign,

            couplePrompt:
              confirmedDesign.couplePrompt,

            hisColor:
              confirmedDesign.hisColor,

            herColor:
              confirmedDesign.herColor,

            hisSide:
              confirmedDesign.hisSide,

            herSide:
              confirmedDesign.herSide,

            hisScale:
              confirmedDesign.hisScale,

            herScale:
              confirmedDesign.herScale,

            price: 1299
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

            isCouple: true,

            hisDesignImage:
              confirmedDesign.hisDesignImage,

            herDesignImage:
              confirmedDesign.herDesignImage,

            hisDesign:
              confirmedDesign.hisDesign,

            herDesign:
              confirmedDesign.herDesign,

            couplePrompt:
              confirmedDesign.couplePrompt,

            hisColor:
              confirmedDesign.hisColor,

            herColor:
              confirmedDesign.herColor,

            hisSide:
              confirmedDesign.hisSide,

            herSide:
              confirmedDesign.herSide,

            hisScale:
              confirmedDesign.hisScale,

            herScale:
              confirmedDesign.herScale
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

      {/* CONFIRM */}

      <button

        onClick={
          handleConfirm
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

          : "Confirm Couple Design"
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