import React, {
  useState
} from "react";

import {
  Check,
  ChevronDown,
  Heart,
  Move,
  Pencil,
  ShoppingCart
} from "lucide-react";

import { getPricingKey } from "../../config/pricing";


export default function SingleActions({

  generatedImage,

  prompt,

  selectedColor,

  selectedSide,

  designTransform,

  confirmedDesign,

  generationId,

  setConfirmedDesign,

  isConfirmed,

  setIsConfirmed,

  API,

  getMockup,
  productType,

  generationPreferences,

  setSuccessMessage,
  onEditWithPrompt,
  onReposition

}) {

  // =====================================
  // SIZE
  // =====================================

  const [selectedSize,
    setSelectedSize] =
      useState("M");

  const [isSizePickerOpen, setIsSizePickerOpen] =
    useState(false);

  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL"
  ];


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
        // CANVAS
        // =====================================

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width = 800;
        canvas.height = 800;

        const ctx =
          canvas.getContext("2d");


        // =====================================
        // MOCKUP IMAGE
        // =====================================

        const mockupImage =
          new Image();

        mockupImage.crossOrigin =
          "anonymous";

        mockupImage.src =
          getMockup(
            productType,
            selectedColor,
            selectedSide
          );


        // =====================================
        // DESIGN IMAGE
        // =====================================

        const designImage =
          new Image();

        designImage.crossOrigin =
          "anonymous";

        designImage.src =
          generatedImage;


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


        // =====================================
        // DRAW MOCKUP
        // =====================================

        ctx.drawImage(

          mockupImage,

          -60,
          -120,

          920,
          1040
        );


        // =====================================
        // DESIGN SIZE + POSITION (from customer transform)
        // =====================================

        // Canvas maps the 920x1040 mockup onto an 800x800 surface,
        // so the box is scaled by 0.8 here.
        const canvasScale = 800 / 920;

        // Match preview defaults per product type
        const designStyles = {
          tshirt: { top: "50%", width: "48%" },
          hoodie: { top: "42%", width: "27%" },
          oversized: { top: "42%", width: "55%" },
          kids: { top: "44%", width: "34%" }
        };
        const defaultStyle = designStyles[productType] || designStyles.tshirt;
        const defaultWidthPct = parseFloat(defaultStyle.width.replace("%", ""));
        const defaultY = parseFloat(defaultStyle.top.replace("%", ""));

        const widthPct =
          designTransform?.widthPct ?? defaultWidthPct;

        const designWidth =
          (widthPct / 100) *
          canvas.width;
        const designHeight = designWidth;

        // Use preview defaults: center X=50%, Y from product type
        const defaultX = 50;
        const centerX = designTransform?.x ?? defaultX;
        const centerY = designTransform?.y ?? defaultY;
        const rotation = designTransform?.rotation ?? 0;

        const x =
          centerX / 100 *
          canvas.width -
          designWidth / 2;
        const y =
          centerY / 100 *
          canvas.height -
          designHeight / 2;


        // =====================================
        // DRAW DESIGN with rotation
        // =====================================

        ctx.save();
        ctx.translate(x + designWidth / 2, y + designHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          designImage,
          -designWidth / 2,
          -designHeight / 2,
          designWidth,
          designHeight
        );
        ctx.restore();


        // =====================================
        // EXPORT PNG
        // =====================================

        const finalMockupBlob =
          await new Promise(

            (resolve) =>

              canvas.toBlob(
                resolve,
                "image/png"
              )
          );


        // =====================================
        // UPLOAD FINAL MOCKUP
        // =====================================

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


        const finalMockupImage =
          uploadRes.data.imageUrl;


        // =====================================
        // SAVE DATA
        // =====================================

        const designData = {

          ...(generationId ? { _id: generationId } : {}),

          generationMode:
            "single",

          preferences:
            generationPreferences || {
              productType,
              designType: "single",
              selectedColor,
              color: selectedColor
            },

          productType:
            generationPreferences?.productType
            || productType,

          designType:
            generationPreferences?.designType
            || "single",

          designImage:
            finalMockupImage,

          transparentDesign:
            generatedImage,

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
            selectedSide,

          designTransform:
            designTransform,

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
        return designData;

      } catch (err) {

        console.error("Could not confirm design:", err);
        showToast("Could not save this design. Please try again.");
        return null;
      }
    };


  // =====================================
  // ADD TO CART
  // =====================================

  const handleAddToCart =
    async () => {

      try {
        const design =
          confirmedDesign || await handleConfirmDesign();

        if (!design) return;

        const token =
          localStorage.getItem(
            "token"
          );

        // Determine pricing key based on product type, design type, and print side
        const pricingKey = getPricingKey(productType, "single", selectedSide);


        await API.post(

          "/cart/add",

          {

            pricingKey,

            isCouple:
              false,

            designImage:
              design.designImage,

            transparentDesign:
              design.transparentDesign,

            prompt:
              design.prompt,

            color:
              design.color,

            selectedColor:
              design.selectedColor,

            size:
              selectedSize,

            side:
              design.side,

            designTransform:
              design.designTransform
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
        setIsSizePickerOpen(false);

      } catch (err) {

        console.error("Could not add design to cart:", err);
        showToast("Could not add this design to cart. Please try again.");
      }
    };


  // =====================================
  // ADD TO WISHLIST
  // =====================================

  const handleWishlist =
    async () => {

      try {
        const design =
          confirmedDesign || await handleConfirmDesign();

        if (!design) return;

        const token =
          localStorage.getItem(
            "token"
          );


        await API.post(

          "/wishlist/add",

          {

            designImage:
              design.designImage,

            transparentDesign:
              design.transparentDesign,

            prompt:
              design.prompt,

            color:
              design.color,

            selectedColor:
              design.selectedColor,

            size:
              selectedSize,

            side:
              design.side,

            designTransform:
              design.designTransform
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

        console.error("Could not add design to wishlist:", err);
        showToast("Could not save this design to your wishlist.");
      }
    };


  return (

    <>

      <div className="workspace-action-toolbar">
        <button
          type="button"
          onClick={onEditWithPrompt}
          aria-label="Edit with prompt"
          title="Edit with prompt"
          className="workspace-action-button"
        >
          <Pencil size={19} />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={onReposition}
          aria-label="Reposition design"
          title="Drag the design on the mockup to reposition it"
          className="workspace-action-button"
        >
          <Move size={19} />
          <span>Move</span>
        </button>
        <div className="workspace-cart-action">
          <button
            type="button"
            onClick={() => setIsSizePickerOpen((open) => !open)}
            aria-expanded={isSizePickerOpen}
            aria-haspopup="dialog"
            className="workspace-action-button"
          >
            <ShoppingCart size={19} />
            <span>Cart</span>
            <ChevronDown size={14} />
          </button>
          {isSizePickerOpen && (
            <div className="workspace-size-picker" role="dialog" aria-label="Select a size">
              <p>Select size</p>
              <div className="workspace-size-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                    className={selectedSize === size ? "is-selected" : ""}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="workspace-size-add"
              >
                Add {selectedSize} to cart
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Save to wishlist"
          title="Save to wishlist"
          className="workspace-action-button"
        >
          <Heart size={19} />
          <span>Save</span>
        </button>
      </div>

      <button
        onClick={handleConfirmDesign}
        disabled={isConfirmed}
        className="workspace-confirm-button"
      >
        {isConfirmed ? <><Check size={17} /> Design Confirmed</> : "Confirm Design"}
      </button>

    </>
  );
}