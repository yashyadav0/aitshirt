import React, {
  useState,
  useRef
} from "react";

import {
  Mic
} from "lucide-react";

import API from "../api";

import {
  removeBackground
} from "@imgly/background-removal";

import GenerationModeToggle
from "../components/GenerationModeToggle";

import GenerationLoader
from "../components/workspace/GenerationLoader";

import GenerateButton
from "../components/workspace/GenerateButton";

import ReferenceUploader
from "../components/workspace/ReferenceUploader";

import SinglePromptBox
from "../components/workspace/SinglePromptBox";

import CouplePromptBox
from "../components/workspace/CouplePromptBox";

import SinglePreview
from "../components/workspace/SinglePreview";

import SingleControls
from "../components/workspace/SingleControls";

import SingleActions
from "../components/workspace/SingleActions";

import CouplePreview
from "../components/workspace/CouplePreview";

import CoupleControls
from "../components/workspace/CoupleControls";

import CoupleActions
from "../components/workspace/CoupleActions";


// ===== FRONT =====

import blackFront
from "../templates/tshirts/black/front.png";

import whiteFront
from "../templates/tshirts/white/front.png";

import redFront
from "../templates/tshirts/red/front.png";


// ===== BACK =====

import blackBack
from "../templates/tshirts/black/back.png";

import whiteBack
from "../templates/tshirts/white/back.png";

import redBack
from "../templates/tshirts/red/back.png";


export default function AIWorkspace() {

  // =====================================
  // STATES
  // =====================================

  const [prompt,
    setPrompt] =
    useState("");

  const [couplePrompt,
    setCouplePrompt] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [generatedImage,
    setGeneratedImage] =
    useState("");

  const [generatedHisImage,
    setGeneratedHisImage] =
    useState("");

  const [generatedHerImage,
    setGeneratedHerImage] =
    useState("");

  const [generationMode,
    setGenerationMode] =
    useState("single");

  const [generationStep,
    setGenerationStep] =
    useState("");

  const [referenceImages,
    setReferenceImages] =
    useState([]);

  const [selectedColor,
    setSelectedColor] =
    useState("white");

  const [selectedSide,
    setSelectedSide] =
    useState("front");

  const [designScale,
    setDesignScale] =
    useState(45);

  const [confirmedDesign,
    setConfirmedDesign] =
    useState(null);

  const [isConfirmed,
    setIsConfirmed] =
    useState(false);

  const [successMessage,
    setSuccessMessage] =
    useState("");


  // =====================================
  // COUPLE STATES
  // =====================================

  const [hisColor,
    setHisColor] =
    useState("white");

  const [herColor,
    setHerColor] =
    useState("black");

  const [hisSide,
    setHisSide] =
    useState("front");

  const [herSide,
    setHerSide] =
    useState("front");

  const [hisScale,
    setHisScale] =
    useState(45);

  const [herScale,
    setHerScale] =
    useState(45);


  const mockupRef =
    useRef(null);


  // =====================================
  // GET MOCKUP
  // =====================================

  const getMockup = (
    color,
    side
  ) => {

    const mockups = {

      white: {
        front: whiteFront,
        back: whiteBack
      },

      black: {
        front: blackFront,
        back: blackBack
      },

      red: {
        front: redFront,
        back: redBack
      }
    };


    return mockups[
      color
    ][side];
  };


  // =====================================
  // GENERATE
  // =====================================

  const handleGenerate =
    async () => {

      try {

        setLoading(true);

        setGeneratedImage("");

        setGeneratedHisImage("");

        setGeneratedHerImage("");

        setConfirmedDesign(null);

        setIsConfirmed(false);


        if (
          generationMode === "single"
        ) {

          setGenerationStep(
            "Enhancing prompt..."
          );

        } else {

          setGenerationStep(
            "Enhancing couple prompt..."
          );
        }


        const formData =
          new FormData();


        formData.append(
          "generationMode",
          generationMode
        );


        // =====================================
        // SINGLE
        // =====================================

        if (
          generationMode === "single"
        ) {

          formData.append(
            "prompt",
            prompt
          );
        }

        // =====================================
        // COUPLE
        // =====================================

        else {

          formData.append(
            "prompt",
            couplePrompt
          );
        }


        // =====================================
        // REFERENCES
        // =====================================

        referenceImages.forEach(
          (file) => {

            formData.append(
              "referenceImages",
              file
            );
          }
        );


        const token =
          localStorage.getItem(
            "token"
          );


        const res =
          await API.post(

            "/generation/create",

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


        // =====================================
        // SINGLE
        // =====================================

        if (
          generationMode === "single"
        ) {

          setGenerationStep(
            "Removing background..."
          );


          try {

            const imageBlob =
              await fetch(
                res.data.imageUrl
              ).then((r) =>
                r.blob()
              );


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


            setGenerationStep(
              "Uploading design..."
            );


            const uploadFormData =
              new FormData();

            uploadFormData.append(
              "image",
              transparentBlob
            );


            const uploadRes =
              await API.post(

                "/upload",

                uploadFormData,

                {
                  headers: {

                    Authorization:
                      `Bearer ${token}`,

                    "Content-Type":
                      "multipart/form-data"
                  }
                }
              );


            setGeneratedImage(
              uploadRes.data.imageUrl
            );

          } catch (bgErr) {

            console.log(
              bgErr
            );

            setGeneratedImage(
              res.data.imageUrl
            );
          }


          setGenerationStep("");
        }


        // =====================================
        // COUPLE
        // =====================================

        else {

          try {

            // =====================================
            // HIS DESIGN
            // =====================================

            setGenerationStep(
              "Removing his background..."
            );


            const hisBlob =
              await fetch(
                res.data.hisImage
              ).then((r) =>
                r.blob()
              );


            const hisTransparentResult =

              await removeBackground(
                hisBlob
              );


            const hisTransparentBlob =

              hisTransparentResult instanceof Blob

                ? hisTransparentResult

                : new Blob(
                    [hisTransparentResult],
                    {
                      type:
                        "image/png"
                    }
                  );


            const hisUploadForm =
              new FormData();

            hisUploadForm.append(
              "image",
              hisTransparentBlob
            );


            const hisUploadRes =
              await API.post(

                "/upload",

                hisUploadForm,

                {
                  headers: {

                    Authorization:
                      `Bearer ${token}`,

                    "Content-Type":
                      "multipart/form-data"
                  }
                }
              );


            setGeneratedHisImage(
              hisUploadRes.data.imageUrl
            );


            // =====================================
            // HER DESIGN
            // =====================================

            setGenerationStep(
              "Removing her background..."
            );


            const herBlob =
              await fetch(
                res.data.herImage
              ).then((r) =>
                r.blob()
              );


            const herTransparentResult =

              await removeBackground(
                herBlob
              );


            const herTransparentBlob =

              herTransparentResult instanceof Blob

                ? herTransparentResult

                : new Blob(
                    [herTransparentResult],
                    {
                      type:
                        "image/png"
                    }
                  );


            const herUploadForm =
              new FormData();

            herUploadForm.append(
              "image",
              herTransparentBlob
            );


            const herUploadRes =
              await API.post(

                "/upload",

                herUploadForm,

                {
                  headers: {

                    Authorization:
                      `Bearer ${token}`,

                    "Content-Type":
                      "multipart/form-data"
                  }
                }
              );


            setGeneratedHerImage(
              herUploadRes.data.imageUrl
            );


            setGenerationStep("");

          } catch (bgErr) {

            console.log(bgErr);

            setGeneratedHisImage(
              res.data.hisImage
            );

            setGeneratedHerImage(
              res.data.herImage
            );

            setGenerationStep("");
          }
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };


  return (

    <div
      className="
        min-h-screen
        bg-black
        text-white
        pb-20
      "
    >

      {/* SUCCESS TOAST */}

      {
        successMessage && (

          <div
            className="
              fixed
              top-6
              left-1/2
              -translate-x-1/2
              z-50
              bg-green-500
              text-white
              px-6
              py-4
              rounded-2xl
              font-bold
              shadow-2xl
            "
          >

            {successMessage}

          </div>
        )
      }


      {/* HEADER */}

      <div
        className="
          px-5
          pt-10
          pb-5
        "
      >

        <h1
          className="
            text-6xl
            font-black
            leading-none
            mb-4
          "
        >

          Create AI
          <br />
          Designs Instantly.

        </h1>

      </div>


      {/* CONTENT */}

      <div
        className="
          px-5
        "
      >

        <GenerationModeToggle

          generationMode={
            generationMode
          }

          setGenerationMode={
            setGenerationMode
          }
        />


        <ReferenceUploader

          referenceImages={
            referenceImages
          }

          setReferenceImages={
            setReferenceImages
          }
        />


        <div
          className="
            bg-[#18181b]
            rounded-[32px]
            p-5
            border
            border-[#27272a]
          "
        >

          {
            generationMode === "single"

            ? (

              <SinglePromptBox

                prompt={prompt}

                setPrompt={
                  setPrompt
                }
              />

            ) : (

              <CouplePromptBox

                couplePrompt={
                  couplePrompt
                }

                setCouplePrompt={
                  setCouplePrompt
                }
              />
            )
          }


          <div
            className="
              flex
              justify-end
              mt-4
            "
          >

            <button
              className="
                w-16
                h-16
                rounded-full
                bg-cyan-500
                flex
                items-center
                justify-center
              "
            >

              <Mic size={30} />

            </button>

          </div>

        </div>


        <GenerateButton

          loading={loading}

          handleGenerate={
            handleGenerate
          }
        />


        <GenerationLoader

          generationStep={
            generationStep
          }
        />


        {/* SINGLE */}

        {
          generationMode === "single"
          &&
          generatedImage
          && (

            <>

              <SinglePreview

                generatedImage={
                  generatedImage
                }

                mockupRef={
                  mockupRef
                }

                getMockup={
                  getMockup
                }

                selectedColor={
                  selectedColor
                }

                selectedSide={
                  selectedSide
                }

                designScale={
                  designScale
                }
              />


              <SingleControls

                selectedColor={
                  selectedColor
                }

                setSelectedColor={
                  setSelectedColor
                }

                selectedSide={
                  selectedSide
                }

                setSelectedSide={
                  setSelectedSide
                }

                designScale={
                  designScale
                }

                setDesignScale={
                  setDesignScale
                }
              />


              <SingleActions

                generatedImage={
                  generatedImage
                }

                prompt={
                  prompt
                }

                selectedColor={
                  selectedColor
                }

                selectedSide={
                  selectedSide
                }

                designScale={
                  designScale
                }

                confirmedDesign={
                  confirmedDesign
                }

                setConfirmedDesign={
                  setConfirmedDesign
                }

                isConfirmed={
                  isConfirmed
                }

                setIsConfirmed={
                  setIsConfirmed
                }

                API={API}

                getMockup={
                  getMockup
                }

                setSuccessMessage={
                  setSuccessMessage
                }
              />

            </>
          )
        }


        {/* COUPLE */}

        {
          generationMode === "couple"
          &&
          generatedHisImage
          &&
          generatedHerImage
          && (

            <>

              <CouplePreview

                generatedHisImage={
                  generatedHisImage
                }

                generatedHerImage={
                  generatedHerImage
                }

                getMockup={
                  getMockup
                }

                hisColor={
                  hisColor
                }

                herColor={
                  herColor
                }

                hisSide={
                  hisSide
                }

                herSide={
                  herSide
                }

                hisScale={
                  hisScale
                }

                herScale={
                  herScale
                }
              />


              <CoupleControls

                hisColor={
                  hisColor
                }

                setHisColor={
                  setHisColor
                }

                herColor={
                  herColor
                }

                setHerColor={
                  setHerColor
                }

                hisScale={
                  hisScale
                }

                setHisScale={
                  setHisScale
                }

                herScale={
                  herScale
                }

                setHerScale={
                  setHerScale
                }
              />


              <CoupleActions

                generatedHisImage={
                  generatedHisImage
                }

                generatedHerImage={
                  generatedHerImage
                }

                getMockup={
                  getMockup
                }

                couplePrompt={
                  couplePrompt
                }

                hisColor={
                  hisColor
                }

                herColor={
                  herColor
                }

                hisSide={
                  hisSide
                }

                herSide={
                  herSide
                }

                hisScale={
                  hisScale
                }

                herScale={
                  herScale
                }

                API={API}

                setSuccessMessage={
                  setSuccessMessage
                }

                confirmedDesign={
                  confirmedDesign
                }

                setConfirmedDesign={
                  setConfirmedDesign
                }

                isConfirmed={
                  isConfirmed
                }

                setIsConfirmed={
                  setIsConfirmed
                }
              />

            </>
          )
        }

      </div>

    </div>
  );
}