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
  showError
} from "../utils/toast";

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

import DoublePromptBox
from "../components/workspace/DoublePromptBox";

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

import DoublePreview
from "../components/workspace/DoublePreview";

import DoubleActions
from "../components/workspace/DoubleActions";


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

  const [confirmedDesign,
    setConfirmedDesign] =
    useState(null);

  const [isConfirmed,
    setIsConfirmed] =
    useState(false);

  const [successMessage,
    setSuccessMessage] =
    useState("");

  const [frontPrompt,
    setFrontPrompt] =
    useState("");

  const [backPrompt,
    setBackPrompt] =
    useState("");
  const [errorMessage,
    setErrorMessage] =
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
    normalizePreferences(preferences);
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
  const recognitionRef =
    useRef(null);
  const isListeningRef =
    useRef(false);
  const generationLockRef =
    useRef(false);
  const generationAbortRef =
    useRef(null);
  const generationRequestIdRef =
    useRef(0);

  const hasGenerated =
    Boolean(
      generatedImage ||
      (
        generatedHisImage &&
        generatedHerImage
      )
    );

  const productDesignScale =
    productType === "hoodie"
      ? 55
      : 48;

  const activeResultMode =
    resolvedPreferences.designType;

  const activeResultProductType =
    resolvedPreferences.productType;

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

  const singleDisplayImage =
    generatedImage;
  const firstDualDisplayImage =
    generatedHisImage;
  const secondDualDisplayImage =
    generatedHerImage;

  const buildGenerationCacheKey =
    (generationPrefs, singlePromptText, couplePromptText, frontPromptText, backPromptText) => {
      const promptText =
        generationPrefs.designType === "couple"
          ? couplePromptText
          : generationPrefs.designType === "double"
            ? `${frontPromptText}|${backPromptText}`
            : singlePromptText;

      const referenceKey =
        referenceImages
          .map(
            (file) =>
              `${file.name}:${file.size}:${file.lastModified}`
          )
          .join("|");

      return JSON.stringify({
        productType: generationPrefs.productType,
        designType: generationPrefs.designType,
        selectedColor: generationPrefs.selectedColor,
        prompt: promptText,
        references: referenceKey
      });
    };

  const readGenerationCache = (cacheKey) => {
    try {
      const cached = sessionStorage.getItem(
        `aiwork:${cacheKey}`
      );

      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const writeGenerationCache = (cacheKey, value) => {
    try {
      sessionStorage.setItem(
        `aiwork:${cacheKey}`,
        JSON.stringify(value)
      );
    } catch {
      // Ignore cache write failures.
    }
  };

  const applyPreset =
    (preset) => {

      if (generationMode === "single") {
        setPrompt(
          preset.prompt
        );
      } else if (generationMode === "double") {
        setFrontPrompt(preset.prompt);
        setBackPrompt(preset.prompt);
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

  const mockups =
    productType === "hoodie"
      ? hoodies
      : tshirts;

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

  if (isListening && recognitionRef.current) {
    isListeningRef.current = false;
    recognitionRef.current.stop();
    return;
  }

  const recognition =
    new SpeechRecognition();

  recognitionRef.current =
    recognition;

  recognition.lang = "en-IN";

  recognition.continuous = true;

  recognition.interimResults = true;

  recognition.onstart = () => {

    isListeningRef.current = true;
    setIsListening(true);
  };

  recognition.onend = () => {

    if (recognitionRef.current === recognition) {
      recognitionRef.current = null;
    }

    setIsListening(false);

    if (isListeningRef.current) {
      window.setTimeout(() => {
        if (isListeningRef.current) {
          startListening();
        }
      }, 350);
    }
  };

  recognition.onresult = (event) => {

    const transcript =
      Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();

    if (!transcript) {
      return;
    }

    if (generationMode === "single") {

      setPrompt((prev) => {
        const base = prev.trim();
        const next = transcript.trim();
        if (!base) return next;
        if (base.toLowerCase().endsWith(next.toLowerCase())) return base;
        return `${base} ${next}`.trim();
      });

    } else if (generationMode === "double") {

      setFrontPrompt((prev) => prev ? `${prev} ${transcript}` : transcript);

    } else {

      setCouplePrompt((prev) => {
        const base = prev.trim();
        const next = transcript.trim();
        if (!base) return next;
        if (base.toLowerCase().endsWith(next.toLowerCase())) return base;
        return `${base} ${next}`.trim();
      });
    }
  };

  recognition.onerror = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current === recognition) {
      recognitionRef.current = null;
    }
  };

  recognition.start();
};
  const handleGenerate =
    async (
      overridePreferences = null
    ) => {

      if (generationLockRef.current) {
        return;
      }

      const generationPrefs =
        normalizePreferences(
          overridePreferences
          || preferences
        );

      const activeMode =
        generationPrefs.designType;
      const cacheKey =
        buildGenerationCacheKey(
          generationPrefs,
          prompt,
          couplePrompt,
          frontPrompt,
          backPrompt
        );
      const cachedGeneration =
        readGenerationCache(
          cacheKey
        );

      if (cachedGeneration) {
        setErrorMessage("");
        setLoading(false);
        setGenerationStep("");

        setActiveGenerationPreferences(
          normalizePreferences(
            cachedGeneration.preferences
            || generationPrefs
          )
        );

        setProductType(
          cachedGeneration.preferences?.productType
          || generationPrefs.productType
        );

        setSelectedColor(
          cachedGeneration.preferences?.selectedColor
          || generationPrefs.selectedColor
        );

        setHisColor(
          cachedGeneration.preferences?.selectedColor
          || generationPrefs.selectedColor
        );

        setHerColor(
          cachedGeneration.preferences?.selectedColor
          || generationPrefs.selectedColor
        );

        setGeneratedImage(
          cachedGeneration.generatedImage || ""
        );
        setGeneratedHisImage(
          cachedGeneration.generatedHisImage || ""
        );
        setGeneratedHerImage(
          cachedGeneration.generatedHerImage || ""
        );
        return;
      }

      generationLockRef.current = true;
      generationRequestIdRef.current += 1;
      const requestId =
        generationRequestIdRef.current;
      const abortController =
        new AbortController();

      if (generationAbortRef.current) {
        generationAbortRef.current.abort();
      }

      generationAbortRef.current =
        abortController;

      try {

        setErrorMessage("");
        setLoading(true);

        setGeneratedImage("");

        setGeneratedHisImage("");

        setGeneratedHerImage("");

        setConfirmedDesign(null);

        setIsConfirmed(false);


        if (activeMode === "single") {
          setGenerationStep("Enhancing prompt...");
        } else if (activeMode === "double") {
          setGenerationStep("Generating front and back designs...");
        } else {
          setGenerationStep("Enhancing couple prompt...");
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

        if (activeMode === "single") {
          formData.append("prompt", prompt);
        } else if (activeMode === "double") {
          formData.append("frontPrompt", frontPrompt);
          formData.append("backPrompt", backPrompt);
        } else {
          formData.append("prompt", couplePrompt);
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
                  `Bearer ${token}`
              },
              signal:
                abortController.signal
            }
          );

        if (requestId !== generationRequestIdRef.current) {
          return;
        }


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

        if (activeMode === "double") {
          setHisSide("front");
          setHerSide("back");
        }


        // =====================================
        // SINGLE
        // =====================================

        if (activeMode === "single") {

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
                  `Bearer ${token}`
              }
            }
          );


            const finalSingleImage =
              uploadRes.data.imageUrl;

            setGeneratedImage(
              finalSingleImage
            );

            writeGenerationCache(
              cacheKey,
              {
                preferences: responsePreferences,
                generatedImage:
                  finalSingleImage
              }
            );

          } catch (bgErr) {

            console.log(
              bgErr
            );

            setGeneratedImage(
              res.data.imageUrl
            );

            writeGenerationCache(
              cacheKey,
              {
                preferences: responsePreferences,
                generatedImage:
                  res.data.imageUrl
              }
            );
          }


          setGenerationStep("");
        } else {

          const firstDesignLabel =
            activeMode === "double" ? "front" : "his";

          const secondDesignLabel =
            activeMode === "double" ? "back" : "her";

          try {

            // =====================================
            // FIRST DESIGN
            // =====================================

            setGenerationStep(
              `Removing ${firstDesignLabel} background...`
            );


            const hisBlob =
              await fetch(
                res.data.frontImage || res.data.hisImage
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
                  `Bearer ${token}`
              }
            }
          );


            const finalHisImage =
              hisUploadRes.data.imageUrl;

            setGeneratedHisImage(
              finalHisImage
            );


            // =====================================
            // SECOND DESIGN
            // =====================================

            setGenerationStep(
              `Removing ${secondDesignLabel} background...`
            );


            const herBlob =
              await fetch(
                res.data.backImage || res.data.herImage
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
                  `Bearer ${token}`
              }
            }
          );


            const finalHerImage =
              herUploadRes.data.imageUrl;

            setGeneratedHerImage(
              finalHerImage
            );

            writeGenerationCache(
              cacheKey,
              {
                preferences: responsePreferences,
                generatedHisImage:
                  finalHisImage,
                generatedHerImage:
                  finalHerImage
              }
            );


            setGenerationStep("");

          } catch (bgErr) {

            console.log(bgErr);

            setGeneratedHisImage(
              res.data.frontImage || res.data.hisImage
            );

            setGeneratedHerImage(
              res.data.backImage || res.data.herImage
            );

            writeGenerationCache(
              cacheKey,
              {
                preferences: responsePreferences,
                generatedHisImage:
                  res.data.frontImage || res.data.hisImage,
                generatedHerImage:
                  res.data.backImage || res.data.herImage
              }
            );

            setGenerationStep("");
          }
        }

      } catch (err) {

        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
          return;
        }

        const apiMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Generation failed";

        console.log(err);

        setErrorMessage(apiMessage);
        showError(apiMessage);

      } finally {

        if (
          generationAbortRef.current === abortController
        ) {
          generationAbortRef.current = null;
        }

        generationLockRef.current = false;
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

      {
        errorMessage && (

          <div
            className="
              fixed
              top-4
              sm:top-6
              right-4
              z-50
              max-w-[calc(100%-2rem)]
              rounded-2xl
              border
              border-red-500/30
              bg-[#171717]
              px-4
              py-3
              text-sm
              text-red-200
              shadow-2xl
            "
          >
            <div className="flex items-center gap-3">
              <span className="min-w-0 flex-1">
                {errorMessage}
              </span>
              <button
                type="button"
                onClick={handleRegenerate}
                className="rounded-xl border border-red-500/30 px-3 py-1 text-xs font-medium text-red-100 transition hover:bg-red-500/10"
              >
                Retry
              </button>
            </div>
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
                  generationMode === "single"

                  ? (

                    <SinglePromptBox
                      prompt={prompt}
                      setPrompt={
                        setPrompt
                      }
                    />

                  ) : generationMode === "double" ? (

                    <DoublePromptBox
                      frontPrompt={frontPrompt}
                      setFrontPrompt={setFrontPrompt}
                      backPrompt={backPrompt}
                      setBackPrompt={setBackPrompt}
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
          (singleDisplayImage || loading)
          && (

            <>

              <SinglePreview

                 generatedImage={singleDisplayImage}
                isLoading={loading && !singleDisplayImage}

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

                designScale={
                  productDesignScale
               }
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

                designScale={
                  productDesignScale
                }

                setDesignScale={
                  setDesignScale
                }
                productType={
                  resolvedPreferences.productType
                }
                setPreferenceColor={
                  setPrefColor
                }
              />


              <SingleActions

                generatedImage={singleDisplayImage}

                prompt={
                  prompt
                }

                selectedColor={
                  resolvedPreferences.selectedColor
                }

                selectedSide={
                  selectedSide
                }

                designScale={
                  productDesignScale
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


        {/* DOUBLE */}

        {
          activeResultMode === "double"
          &&
          (loading || (firstDualDisplayImage && secondDualDisplayImage))
          && (

            <>

              <DoublePreview
                frontImage={firstDualDisplayImage}
                backImage={secondDualDisplayImage}
                getMockup={getMockup}
                productType={resolvedPreferences.productType}
                color={resolvedPreferences.selectedColor}
                isLoading={loading && !firstDualDisplayImage && !secondDualDisplayImage}
              />

              <DoubleActions
                frontImage={firstDualDisplayImage}
                backImage={secondDualDisplayImage}
                frontPrompt={frontPrompt}
                backPrompt={backPrompt}
                color={resolvedPreferences.selectedColor}
                productType={resolvedPreferences.productType}
                getMockup={getMockup}
                API={API}
                setSuccessMessage={setSuccessMessage}
                confirmedDesign={confirmedDesign}
                setConfirmedDesign={setConfirmedDesign}
                isConfirmed={isConfirmed}
                setIsConfirmed={setIsConfirmed}
                generationPreferences={resolvedPreferences}
              />

            </>
          )
        }


        {/* COUPLE */}

        {
          activeResultMode === "couple"
          &&
          firstDualDisplayImage
          &&
          secondDualDisplayImage
          && (

            <>

              <CouplePreview

  productType={
    resolvedPreferences.productType
  }

  generatedHisImage={
    firstDualDisplayImage
  }

  generatedHerImage={
    secondDualDisplayImage
  }

  isLoading={
    loading && !firstDualDisplayImage && !secondDualDisplayImage
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
               
              />


              <CoupleActions

                generatedHisImage={
                  firstDualDisplayImage
                }

                generatedHerImage={
                  secondDualDisplayImage
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

                hisScale={
                  productDesignScale
                }

                herScale={
                  productDesignScale
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
