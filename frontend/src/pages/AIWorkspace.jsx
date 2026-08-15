import React, {
  useState,
  useRef,
  useEffect
} from "react";

import {
  Mic
} from "lucide-react";

import API from "../api";

import {
  removeBackground
} from "@imgly/background-removal";

import DesignPreferences
from "../components/workspace/DesignPreferences";

import PreferenceChips
from "../components/workspace/PreferenceChips";

import useDesignPreferences
from "../hooks/useDesignPreferences";

import {
  normalizePreferences
} from "../config/designPreferences";

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

import DoubleSidePreview
from "../components/workspace/DoubleSidePreview";

import DoubleSideControls
from "../components/workspace/DoubleSideControls";

import DoubleSideActions
from "../components/workspace/DoubleSideActions";

import processGeneratedImage
from "../components/workspace/processGeneratedImage";


// ===== FRONT =====

import blackFront
from "../templates/tshirts/black/front.png";

import whiteFront
from "../templates/tshirts/white/front.png";

import redFront
from "../templates/tshirts/red/front.png";

import hoodieBlackFront
from "../templates/hoodies/black/front.png";

import hoodieWhiteFront
from "../templates/hoodies/white/front.png";

import hoodieBlueFront
from "../templates/hoodies/blue/front.png";

import oversizedBlackFront
from "../templates/oversized/black/front.png";

import oversizedWhiteFront
from "../templates/oversized/white/front.png";

import oversizedRedFront
from "../templates/oversized/red/front.png";

import kidsBlackFront
from "../templates/kids/black/front.png";

import kidsWhiteFront
from "../templates/kids/white/front.png";

import kidsRedFront
from "../templates/kids/red/front.png";


// ===== BACK =====

import blackBack
from "../templates/tshirts/black/back.png";

import whiteBack
from "../templates/tshirts/white/back.png";

import redBack
from "../templates/tshirts/red/back.png";

import hoodieBlackBack
from "../templates/hoodies/black/back.png";

import hoodieWhiteBack
from "../templates/hoodies/white/back.png";

import hoodieBlueBack
from "../templates/hoodies/blue/back.png";

import oversizedBlackBack
from "../templates/oversized/black/back.png";

import oversizedWhiteBack
from "../templates/oversized/white/back.png";

import oversizedRedBack
from "../templates/oversized/red/back.png";

import kidsBlackBack
from "../templates/kids/black/back.png";

import kidsWhiteBack
from "../templates/kids/white/back.png";

import kidsRedBack
from "../templates/kids/red/back.png";

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

  const [generatedFrontImage,
    setGeneratedFrontImage] =
    useState("");

  const [generatedBackImage,
    setGeneratedBackImage] =
    useState("");

  const [generationMode,
    setGenerationMode] =
    useState("single");

  const [productType,
    setProductType] =
    useState("tshirt");

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

  const [designTilt,
    setDesignTilt] =
    useState(0);

  const [confirmedDesign,
    setConfirmedDesign] =
    useState(null);

  const [isConfirmed,
    setIsConfirmed] =
    useState(false);

  const [successMessage,
    setSuccessMessage] =
    useState("");
  const [isListening,
    setIsListening] =
    useState(false);

  const fallbackPresets = [
    {
      name: "Anime",
      emoji: "🔥",
      prompt: "Create an anime-inspired apparel design with bold artwork and premium typography."
    },
    {
      name: "Gym",
      emoji: "💪",
      prompt: "Create a premium gym apparel design with powerful typography and athletic energy."
    },
    {
      name: "Gaming",
      emoji: "🎮",
      prompt: "Create a gaming-inspired apparel design with neon details and futuristic graphics."
    },
    {
      name: "Cars",
      emoji: "🏎️",
      prompt: "Create a motorsport apparel design with speed lines, racing typography, and premium detail."
    },
    {
      name: "Luxury",
      emoji: "💎",
      prompt: "Create a luxury streetwear apparel design with minimal premium typography and elegant artwork."
    }
  ];

  const [presets,
    setPresets] =
    useState(
      fallbackPresets
    );

  const {
    preferences,
    setProductType: setPrefProductType,
    setDesignType: setPrefDesignType,
    setColor: setPrefColor
  } = useDesignPreferences();

  const [activeGenerationPreferences,
    setActiveGenerationPreferences] =
    useState(null);

  const resolvedPreferences =
    normalizePreferences({
      ...preferences,
      designType: generationMode,
      selectedColor,
      color: selectedColor
    });
  const selectedPreferenceColor =
    resolvedPreferences.selectedColor;
  const selectedPreferenceProductType =
    resolvedPreferences.productType;
  const selectedPreferenceDesignType =
    resolvedPreferences.designType;


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



  const mockupRef =
    useRef(null);

  const hasGenerated =
    Boolean(
      generatedImage ||
      (
        generatedHisImage &&
        generatedHerImage
      ) ||
      (
        generatedFrontImage &&
        generatedBackImage
      )
    );

  const activeResultMode =
    generationMode;

  const activeResultProductType =
    productType;

  useEffect(() => {

    const loadPresets =
      async () => {

        try {

          const res =
            await API.get(
              "/presets"
            );

          if (
            res.data?.length
          ) {
            setPresets(
              res.data
            );
          }

        } catch (err) {

          console.log(
            err
          );
        }
      };

    loadPresets();

  }, []);

  useEffect(() => {

    setGenerationMode(
      selectedPreferenceDesignType
    );

    setSelectedColor(
      selectedPreferenceColor
    );

    setProductType(
      selectedPreferenceProductType
    );

    setHisColor(
      selectedPreferenceColor
    );

    setHerColor(
      selectedPreferenceColor
    );

  }, [
    selectedPreferenceDesignType,
    selectedPreferenceProductType,
    selectedPreferenceColor
  ]);

  // Bootstrap generationMode / productType / selectedColor from
  // stored preferences on first mount.  On initial render the
  // state variables above are hardcoded defaults, so the sync
  // effect above is a no-op — this one-time read closes the gap.
  useEffect(() => {
    if (preferences.designType)
      setGenerationMode(preferences.designType);
    if (preferences.productType)
      setProductType(preferences.productType);
    if (preferences.selectedColor || preferences.color) {
      const color =
        preferences.selectedColor || preferences.color;
      setSelectedColor(color);
      setHisColor(color);
      setHerColor(color);
    }
  }, []); // mount only

  // Kids only supports single design — reset generationMode if productType becomes kids
  useEffect(() => {
    if (preferences.productType === "kids" && generationMode !== "single") {
      setGenerationMode("single");
    }
  }, [preferences.productType]);

  const applyPreset =
    (preset) => {

      if (
        generationMode === "single" ||
        generationMode === "double"
      ) {
        setPrompt(
          preset.prompt
        );
      } else {
        setCouplePrompt(
          preset.prompt
        );
      }
    };

  const handlePreferenceDesignTypeChange =
    (designType) => {

      setGenerationMode(
        designType
      );
    };


  // =====================================
  // GET MOCKUP
  // =====================================

  const getMockup = (
    productType,
    color,
    side
  ) => {

  const tshirts = {

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

  const hoodies = {

    white: {
      front: hoodieWhiteFront,
      back: hoodieWhiteBack
    },

    black: {
      front: hoodieBlackFront,
      back: hoodieBlackBack
    },

    blue: {
      front: hoodieBlueFront,
      back: hoodieBlueBack
    }
  };

  const oversized = {

    white: {
      front: oversizedWhiteFront,
      back: oversizedWhiteBack
    },

    black: {
      front: oversizedBlackFront,
      back: oversizedBlackBack
    },

    red: {
      front: oversizedRedFront,
      back: oversizedRedBack
    }
  };

  const kids = {

    white: {
      front: kidsWhiteFront,
      back: kidsWhiteBack
    },

    black: {
      front: kidsBlackFront,
      back: kidsBlackBack
    },

    red: {
      front: kidsRedFront,
      back: kidsRedBack
    }
  };

  const mockupMap = {
    tshirt: tshirts,
    hoodie: hoodies,
    oversized: oversized,
    kids: kids
  };

  const mockups =
    mockupMap[productType] || tshirts;

  const productMockups =
    mockups[color] || mockups.white;

  return productMockups[side] || productMockups.front;
  };


  // =====================================
  // GENERATE
  // =====================================
const startListening = () => {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    alert(
      "Speech recognition not supported in this browser"
    );

    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.lang = "en-IN";

  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.onstart = () => {

    setIsListening(true);
  };

  recognition.onend = () => {

    setIsListening(false);
  };

  recognition.onresult = (event) => {

    const transcript =
      event.results[0][0].transcript;

    if (
      generationMode === "single" ||
      generationMode === "double"
    ) {

      setPrompt(transcript);

    } else {

      setCouplePrompt(transcript);
    }
  };

  recognition.start();
};
  const handleGenerate =
    async (
      overridePreferences = null
    ) => {

      const isEventObject =
        overridePreferences &&
        (
          overridePreferences.nativeEvent ||
          typeof overridePreferences.preventDefault === "function"
        );

      const generationPrefs =
        normalizePreferences(
          (
            overridePreferences &&
            !isEventObject
          )
          || {
            ...preferences,
            designType: generationMode,
            selectedColor,
            color: selectedColor
          }
        );

      const activeMode =
        generationPrefs.designType;

      try {

        setLoading(true);

        setGeneratedImage("");

        setGeneratedHisImage("");

        setGeneratedHerImage("");

        setGeneratedFrontImage("");

        setGeneratedBackImage("");

        setConfirmedDesign(null);

        setIsConfirmed(false);


        if (
          activeMode === "single"
        ) {

          setGenerationStep(
            "Enhancing prompt..."
          );

        } else if (
          activeMode === "double"
        ) {

          setGenerationStep(
            "Enhancing double-side prompt..."
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
          activeMode
        );

        formData.append(
          "productType",
          generationPrefs.productType
        );

        formData.append(
          "designType",
          generationPrefs.designType
        );

        formData.append(
          "color",
          generationPrefs.selectedColor || generationPrefs.color
        );

        formData.append(
          "selectedColor",
          generationPrefs.selectedColor || generationPrefs.color
        );

        formData.append(
          "preferences",
          JSON.stringify(
            generationPrefs
          )
        );


        // =====================================
        // SINGLE
        // =====================================

        if (
          activeMode === "single" ||
          activeMode === "double"
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


        const responsePreferences =
          normalizePreferences(
            res.data.preferences
            || generationPrefs
          );

        setActiveGenerationPreferences(
          responsePreferences
        );

        setProductType(
          responsePreferences.productType
        );

        setSelectedColor(
          responsePreferences.selectedColor || responsePreferences.color
        );

        setHisColor(
          responsePreferences.selectedColor || responsePreferences.color
        );

        setHerColor(
          responsePreferences.selectedColor || responsePreferences.color
        );


        // =====================================
        // SINGLE
        // =====================================

        if (
          activeMode === "single"
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
        // DOUBLE-SIDE
        // =====================================

        else if (
          activeMode === "double"
        ) {

          // Render immediately from raw response
          setGeneratedFrontImage(
            res.data.frontImage
          );

          setGeneratedBackImage(
            res.data.backImage
          );

          setGenerationStep("");

          // Background removal + upload can safely replace after display
          try {

            setGenerationStep(
              "Processing Front..."
            );

            const frontArtwork =
              await processGeneratedImage(
                res.data.frontImage,
                token
              );

            if (frontArtwork)
              setGeneratedFrontImage(
                frontArtwork
              );

            setGenerationStep(
              "Processing Back..."
            );

            const backArtwork =
              await processGeneratedImage(
                res.data.backImage,
                token
              );

            if (backArtwork)
              setGeneratedBackImage(
                backArtwork
              );

            setGenerationStep("");

          } catch (bgErr) {

            console.log(
              bgErr
            );

            setGenerationStep("");
          }
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

  const handleRegenerate =
    () => {
      handleGenerate();
    };


  return (

    <div
      className="
        min-h-screen
        bg-[#0b0b0b]
        text-white
        px-4
        pb-20
        pt-20
        md:px-8
        md:pt-8
      "
    >

      {/* SUCCESS TOAST */}

      {
        successMessage && (

          <div
            className="
              fixed
              top-4
              sm:top-6
              left-1/2
              -translate-x-1/2
              z-50
              bg-[#171717]
              border
              border-[#2f2f2f]
              text-white
              px-4
              sm:px-6
              py-2
              sm:py-3
              rounded-xl
              sm:rounded-2xl
              text-xs
              sm:text-sm
              shadow-2xl
              max-w-[calc(100%-2rem)]
            "
          >

            {successMessage}

          </div>
        )
      }


      <div
        className="
          mx-auto
          max-w-6xl
          px-4
          sm:px-6
          md:px-0
        "
      >

        <header
          className={`
            transition-all
            duration-500
            ${
              hasGenerated
                ? "mb-6 sm:mb-8"
                : "flex min-h-[calc(100vh-140px)] flex-col justify-center"
            }
          `}
        >

          <div
            className={`
              mx-auto
              w-full
              ${
                hasGenerated
                  ? "max-w-4xl"
                  : "max-w-3xl text-center"
              }
            `}
          >

            <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-cyan-300">
              AI creative studio
            </p>

            <h1
              className="
                text-3xl
                sm:text-4xl
                font-semibold
                tracking-tight
                text-white
                md:text-5xl
                lg:text-6xl
                leading-tight
              "
            >
              Imagine Your Style...
            </h1>

            <p
              className="
                mx-auto
                mt-3
                sm:mt-4
                max-w-2xl
                text-sm
                sm:text-base
                leading-6
                sm:leading-7
                text-zinc-400
                md:text-lg
              "
            >
              Describe an idea, generate artwork, then apply it to premium apparel mockups.
            </p>

            <div
              className="
                mt-6
                sm:mt-8
                rounded-2xl
                sm:rounded-[28px]
                border
                border-[#2f2f2f]
                bg-[#171717]
                p-3
                shadow-2xl
                shadow-black/30
              "
            >

              <ReferenceUploader
                referenceImages={
                  referenceImages
                }
                setReferenceImages={
                  setReferenceImages
                }
              />

              <div className="px-2 pb-2">
                <DesignPreferences
                  preferences={preferences}
                  setProductType={setPrefProductType}
                  setDesignType={setPrefDesignType}
                  setColor={setPrefColor}
                  onDesignTypeChange={
                    handlePreferenceDesignTypeChange
                  }
                />
              </div>

              <div className="px-2">
                {
                  generationMode === "single" ||
                  generationMode === "double"

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
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  onClick={startListening}
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#333]
                    transition
                    ${
                      isListening
                        ? "bg-red-500 text-white"
                        : "bg-[#202020] text-zinc-300 hover:text-white"
                    }
                  `}
                  aria-label="Voice input"
                >
                  <Mic size={20} />
                </button>

                <GenerateButton
                  loading={loading}
                  handleGenerate={
                    handleGenerate
                  }
                />
              </div>

            </div>

            <div
              className="
                mt-5
                flex
                gap-2
                overflow-x-auto
                pb-1
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {
                presets.map((preset) => (

                  <button
                    key={preset._id || preset.name}
                    onClick={() =>
                      applyPreset(
                        preset
                      )
                    }
                    className="
                      shrink-0
                      rounded-full
                      border
                      border-[#2f2f2f]
                      bg-[#121212]
                      px-4
                      py-3
                      text-sm
                      text-zinc-300
                      transition
                      hover:border-cyan-500/60
                      hover:text-white
                    "
                  >
                    {preset.emoji} {preset.name}
                  </button>
                ))
              }
            </div>

            {
              loading && (
                <GenerationLoader
                  generationStep={
                    generationStep
                  }
                />
              )
            }

          </div>

        </header>

        {
          hasGenerated
          && resolvedPreferences && (
            <PreferenceChips
              preferences={
                resolvedPreferences
              }
              onRegenerate={
                handleRegenerate
              }
              loading={loading}
            />
          )
        }


        {/* SINGLE */}

        {
          activeResultMode === "single"
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

                productType={
                   activeResultProductType
                }

                selectedColor={
                  resolvedPreferences.selectedColor
                }

                selectedSide={
                  selectedSide
                }

                designScale={designScale}
                designTilt={designTilt}
              />


              <SingleControls

                selectedColor={
                  resolvedPreferences.selectedColor
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

                designScale={designScale}

                setDesignScale={
                  setDesignScale
                }
                designTilt={designTilt}
                setDesignTilt={setDesignTilt}
                productType={
                  resolvedPreferences.productType
                }
                setPreferenceColor={
                  setPrefColor
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
                  resolvedPreferences.selectedColor
                }

                selectedSide={
                  selectedSide
                }

                designScale={designScale}
                designTilt={designTilt}

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

                productType={
                  resolvedPreferences.productType
                }

                generationPreferences={
                  resolvedPreferences
                }
              />

            </>
          )
        }


        {/* COUPLE */}

  {
    activeResultMode === "couple"
          &&
          generatedHisImage
          &&
          generatedHerImage
          && (

            <>

              <CouplePreview

  productType={
    resolvedPreferences.productType
  }

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

  designScale={designScale}
          designTilt={designTilt}

/>


              <CoupleControls

  productType={
                  resolvedPreferences.productType
                }


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

                hisSide={
                  hisSide
                }

                setHisSide={
                  setHisSide
                }

                herSide={
                  herSide
                }

                setHerSide={
                  setHerSide
                }

                designScale={designScale}
                setDesignScale={setDesignScale}
                designTilt={designTilt}
                setDesignTilt={setDesignTilt}

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

  productType={
                  resolvedPreferences.productType
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

                hisScale={designScale}
                hisTilt={designTilt}

                herScale={designScale}
                herTilt={designTilt}

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

  generationPreferences={
                  resolvedPreferences
                }
              />

            </>
          )
        }


        {/* DOUBLE-SIDE */}

        {
          activeResultMode === "double"
          &&
          generatedFrontImage
          &&
          generatedBackImage
          && (

            <>

              <DoubleSidePreview

                frontImage={
                  generatedFrontImage
                }

                backImage={
                  generatedBackImage
                }

                getMockup={
                  getMockup
                }

                productType={
                  resolvedPreferences.productType
                }

                selectedColor={
                  resolvedPreferences.selectedColor
                }

                isLoading={loading}

                onRendered={() => {}}

                onRenderError={(msg) =>
                  setSuccessMessage(msg)
                }

                designScale={designScale}
                designTilt={designTilt}
              />


              <DoubleSideControls

                productType={
                  resolvedPreferences.productType
                }

                selectedColor={
                  resolvedPreferences.selectedColor
                }

                setSelectedColor={
                  setSelectedColor
                }

                setPreferenceColor={
                  setPrefColor
                }

                designScale={designScale}
                setDesignScale={setDesignScale}
                designTilt={designTilt}
                setDesignTilt={setDesignTilt}
              />


              <DoubleSideActions

                generatedFrontImage={
                  generatedFrontImage
                }

                generatedBackImage={
                  generatedBackImage
                }

                prompt={
                  prompt
                }

                selectedColor={
                  resolvedPreferences.selectedColor
                }

                getMockup={
                  getMockup
                }

                productType={
                  resolvedPreferences.productType
                }

                designScale={designScale}
                designTilt={designTilt}

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

                setSuccessMessage={
                  setSuccessMessage
                }

                generationPreferences={
                  resolvedPreferences
                }
              />

            </>
          )
        }

      </div>

    </div>
  );
}
