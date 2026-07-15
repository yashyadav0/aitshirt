import {
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

import { preloadArtwork, prepareArtwork } from "../utils/artworkPipeline";

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

  const [generationStep,
    setGenerationStep] =
    useState("");

  const [referenceImages,
    setReferenceImages] =
    useState([]);

  const [selectedSide,
    setSelectedSide] =
    useState("front");

  const [confirmedDesign,
    setConfirmedDesign] =
    useState(null);

  const [isConfirmed,
    setIsConfirmed] =
    useState(false);

  const [successMessage,
    setSuccessMessage] =
    useState("");

  const [errorMessage,
    setErrorMessage] =
    useState("");

  // Regeneration is intentionally unavailable until the preview reports that
  // its mockup and generated artwork have both painted successfully.
  const [renderedMockupKey,
    setRenderedMockupKey] =
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

  const resolvedPreferences =
    normalizePreferences(preferences);
  const selectedPreferenceDesignType =
    resolvedPreferences.designType;

  // The visible prompt, UI mode, cache key, and API request must all derive
  // from one source of truth. Keeping a second mode/prompt state let the UI
  // display text that the generation request could not see.
  const generationMode =
    selectedPreferenceDesignType;


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
    resolvedPreferences.productType === "hoodie"
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

  const singleDisplayImage =
    generatedImage;
  const firstDualDisplayImage =
    generatedHisImage;
  const secondDualDisplayImage =
    generatedHerImage;

  const previewRenderKey = [
    activeResultMode,
    activeResultProductType,
    singleDisplayImage,
    firstDualDisplayImage,
    secondDualDisplayImage,
    hisColor,
    herColor,
    hisSide,
    herSide,
    resolvedPreferences.selectedColor,
    selectedSide
  ].join("|");

  const mockupReady = Boolean(
    renderedMockupKey
    && renderedMockupKey === previewRenderKey
  );

  const buildGenerationCacheKey =
    (generationPrefs, promptText) => {

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
      setPrompt(preset.prompt);
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

    setPrompt((previousPrompt) => {
      const base = previousPrompt.trim();
      const next = transcript.trim();
      if (!base) return next;
      if (base.toLowerCase().endsWith(next.toLowerCase())) return base;
      return `${base} ${next}`.trim();
    });
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
      const activePrompt =
        prompt;

      if (!activePrompt.trim()) {
        const message = "Describe the artwork you want before generating a design.";
        setErrorMessage(message);
        showError(message);
        return;
      }

      const cacheKey =
        buildGenerationCacheKey(
          generationPrefs,
          activePrompt
        );
      const cachedGeneration =
        readGenerationCache(cacheKey);

      if (cachedGeneration) {
        setRenderedMockupKey("");
        setErrorMessage("");
        setLoading(false);
        setGenerationStep("");

        let cachedArtwork;
        try {
          const [single, first, second] = await Promise.all([
            cachedGeneration.generatedImage
              ? preloadArtwork(cachedGeneration.generatedImage, { label: "cached single artwork" })
              : Promise.resolve(""),
            cachedGeneration.generatedHisImage
              ? preloadArtwork(cachedGeneration.generatedHisImage, { label: "cached first artwork" })
              : Promise.resolve(""),
            cachedGeneration.generatedHerImage
              ? preloadArtwork(cachedGeneration.generatedHerImage, { label: "cached second artwork" })
              : Promise.resolve("")
          ]);
          cachedArtwork = { single, first, second };
        } catch (cacheError) {
          console.warn("[generation-cache] Discarding artwork that can no longer be rendered.", cacheError);
          sessionStorage.removeItem(`aiwork:${cacheKey}`);
          return handleGenerate(overridePreferences);
        }

        setHisColor(
          cachedGeneration.preferences?.selectedColor
          || generationPrefs.selectedColor
        );

        setHerColor(
          cachedGeneration.preferences?.selectedColor
          || generationPrefs.selectedColor
        );

        setGeneratedImage(
          cachedArtwork.single
        );
        setGeneratedHisImage(
          cachedArtwork.first
        );
        setGeneratedHerImage(
          cachedArtwork.second
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
        setRenderedMockupKey("");

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

        formData.append("prompt", activePrompt);


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

        if (activeMode === "double") {
          console.log("[double-design] raw API response", res);
          console.log("[double-design] parsed API response", res.data);
          console.debug("[double-design] candidate image URLs", {
            front: res.data?.frontImage,
            back: res.data?.backImage,
            generatedImages: res.data?.generatedImages,
            images: res.data?.images,
            output: res.data?.output,
            candidates: res.data?.candidates,
            predictions: res.data?.predictions
          });

          const frontArtwork = res.data?.artwork?.front?.url || res.data?.frontImage;
          const backArtwork = res.data?.artwork?.back?.url || res.data?.backImage;
          console.log("[double-design] normalized artwork payload", {
            frontPresent: Boolean(frontArtwork),
            backPresent: Boolean(backArtwork),
            artwork: res.data?.artwork || null
          });

          if (!frontArtwork || !backArtwork) {
            const details = res.data?.details
              ? ` Front: ${res.data.details.front || "not returned"}. Back: ${res.data.details.back || "not returned"}.`
              : "";
            throw new Error(`Double-side API returned no complete artwork payload.${details}`);
          }

          res.data.frontImage = frontArtwork;
          res.data.backImage = backArtwork;
        }

        if (requestId !== generationRequestIdRef.current) {
          return;
        }


        const responsePreferences =
          normalizePreferences(
            res.data.preferences
            || generationPrefs
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

        if (activeMode === "single") {
          if (!res.data?.imageUrl) {
            throw new Error("The image generator completed without returning artwork for the single design.");
          }

          const preparedArtwork = await prepareArtwork({
            source: res.data.imageUrl,
            api: API,
            token,
            label: "single design",
            onStep: setGenerationStep
          });

          if (requestId !== generationRequestIdRef.current) return;

          setGeneratedImage(preparedArtwork.url);
          writeGenerationCache(cacheKey, {
            preferences: responsePreferences,
            generatedImage: preparedArtwork.url
          });
          setGenerationStep("");
        } else {

          const firstDesignLabel =
            activeMode === "double" ? "front" : "his";

          const secondDesignLabel =
            activeMode === "double" ? "back" : "her";

          const firstSource = activeMode === "double"
            ? res.data?.artwork?.front?.url || res.data?.frontImage
            : res.data?.hisImage || res.data?.frontImage;
          const secondSource = activeMode === "double"
            ? res.data?.artwork?.back?.url || res.data?.backImage
            : res.data?.herImage || res.data?.backImage;

          if (!firstSource || !secondSource) {
            throw new Error(`The generator completed without both ${firstDesignLabel} and ${secondDesignLabel} artworks.`);
          }

          // Rendering is not allowed to wait on background removal or storage.
          // A valid generated image should appear as soon as the browser has
          // decoded it; post-processing can safely replace it afterwards.
          const [readyFirstSource, readySecondSource] = await Promise.all([
            preloadArtwork(firstSource, { label: `${firstDesignLabel} design` }),
            preloadArtwork(secondSource, { label: `${secondDesignLabel} design` })
          ]);

          if (requestId !== generationRequestIdRef.current) return;

          let currentFirstSource = readyFirstSource;
          let currentSecondSource = readySecondSource;
          setGeneratedHisImage(currentFirstSource);
          setGeneratedHerImage(currentSecondSource);
          writeGenerationCache(cacheKey, {
            preferences: responsePreferences,
            generatedHisImage: currentFirstSource,
            generatedHerImage: currentSecondSource
          });

          // Background-removal uses a sizeable browser model. Process the
          // two sides in sequence so one slow model task cannot starve both
          // previews or keep their initial render from occurring.
          const firstArtwork = await prepareArtwork({
            source: readyFirstSource,
            api: API,
            token,
            label: `${firstDesignLabel} design`,
            onStep: setGenerationStep
          });

          if (requestId !== generationRequestIdRef.current) return;

          currentFirstSource = firstArtwork.url;
          setGeneratedHisImage(currentFirstSource);
          writeGenerationCache(cacheKey, {
            preferences: responsePreferences,
            generatedHisImage: currentFirstSource,
            generatedHerImage: currentSecondSource
          });

          const secondArtwork = await prepareArtwork({
            source: readySecondSource,
            api: API,
            token,
            label: `${secondDesignLabel} design`,
            onStep: setGenerationStep
          });

          if (requestId !== generationRequestIdRef.current) return;

          currentSecondSource = secondArtwork.url;
          setGeneratedHerImage(currentSecondSource);
          writeGenerationCache(cacheKey, {
            preferences: responsePreferences,
            generatedHisImage: currentFirstSource,
            generatedHerImage: currentSecondSource
          });
          setGenerationStep("");
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

  const handlePreviewRenderError = (message) => {
    setRenderedMockupKey("");
    setErrorMessage(message);
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
                />
              </div>

              <div className="px-2">
                <SinglePromptBox
                  prompt={prompt}
                  setPrompt={setPrompt}
                  placeholder={
                    generationMode === "double"
                      ? "Describe the shared front-and-back apparel design..."
                      : generationMode === "couple"
                        ? "Describe the matching couple apparel designs..."
                        : "Describe your dream design..."
                  }
                />
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
                mockupReady
                  ? handleRegenerate
                  : undefined
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

                onRendered={() => setRenderedMockupKey(previewRenderKey)}
                onRenderError={handlePreviewRenderError}
              />


              <SingleControls

                selectedColor={
                  resolvedPreferences.selectedColor
                }

                setSelectedColor={setPrefColor}

                selectedSide={
                  selectedSide
                }

                setSelectedSide={
                  setSelectedSide
                }

                designScale={
                  productDesignScale
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

              <CouplePreview
                designVariant="double"
                productType={resolvedPreferences.productType}
                generatedHisImage={firstDualDisplayImage}
                generatedHerImage={secondDualDisplayImage}
                getMockup={getMockup}
                hisColor={resolvedPreferences.selectedColor}
                herColor={resolvedPreferences.selectedColor}
                hisSide="front"
                herSide="back"
                isLoading={loading && !firstDualDisplayImage && !secondDualDisplayImage}
                onRendered={() => setRenderedMockupKey(previewRenderKey)}
                onRenderError={handlePreviewRenderError}
              />

              <CoupleActions
                designVariant="double"
                generatedHisImage={firstDualDisplayImage}
                generatedHerImage={secondDualDisplayImage}
                getMockup={getMockup}
                productType={resolvedPreferences.productType}
                couplePrompt={prompt}
                hisColor={resolvedPreferences.selectedColor}
                herColor={resolvedPreferences.selectedColor}
                hisSide="front"
                herSide="back"
                hisScale={45}
                herScale={45}
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

  onRendered={() => setRenderedMockupKey(previewRenderKey)}
  onRenderError={handlePreviewRenderError}

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
                  prompt
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
