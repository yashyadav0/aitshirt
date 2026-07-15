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
    (generationPrefs, singlePromptText, couplePromptText) => {
      const promptText =
        generationPrefs.designType === "couple"
          ? couplePromptText
          : generationPrefs.designType === "double"
            ? singlePromptText
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

  const extractArtworkCandidate = (value, trail = "response", seen = new Set()) => {
    if (value == null) return null;
    if (value instanceof Blob || value instanceof ArrayBuffer) return { value, trail };

    if (typeof value === "string") {
      const source = value.trim();
      if (/^data:image\//i.test(source) || /^https?:\/\//i.test(source)) {
        return { value: source, trail };
      }
      if (/^[A-Za-z0-9+/\r\n]+={0,2}$/.test(source)) {
        return { value: `data:image/png;base64,${source.replace(/\s/g, "")}`, trail };
      }
      try {
        return extractArtworkCandidate(JSON.parse(source), `${trail}.json`, seen);
      } catch {
        return null;
      }
    }

    if (typeof value !== "object" || seen.has(value)) return null;
    seen.add(value);

    const directFields = ["inlineData", "image", "imageUrl", "image_url", "url", "uri", "fileUri", "file_uri", "b64_json", "base64", "data"];
    for (const field of directFields) {
      const candidate = extractArtworkCandidate(value[field], `${trail}.${field}`, seen);
      if (candidate) return candidate;
    }

    const containers = ["generatedImages", "images", "output", "data", "candidates", "predictions", "content", "parts", "results"];
    for (const field of containers) {
      const values = Array.isArray(value[field]) ? value[field] : [value[field]];
      for (let index = 0; index < values.length; index += 1) {
        const candidate = extractArtworkCandidate(values[index], `${trail}.${field}[${index}]`, seen);
        if (candidate) return candidate;
      }
    }
    return null;
  };

  const preloadGeneratedImage = async (payload, label) => {
    console.debug(`[double-design] raw ${label} payload`, payload);
    const candidate = extractArtworkCandidate(payload);
    console.debug(`[double-design] parsed ${label} candidate`, candidate?.trail || "none");

    if (!candidate) {
      throw new Error(`No image returned for the ${label} design. The API response did not contain a supported image format.`);
    }

    let source = candidate.value;
    if (source instanceof Blob) {
      if (!source.size) throw new Error(`The ${label} design returned an empty Blob.`);
      source = URL.createObjectURL(source);
    } else if (source instanceof ArrayBuffer) {
      if (!source.byteLength) throw new Error(`The ${label} design returned empty binary data.`);
      source = URL.createObjectURL(new Blob([source], { type: "image/png" }));
    }

    console.debug(`[double-design] selected ${label} artwork URL`, typeof source === "string" ? source.slice(0, 96) : source);
    const validSource = typeof source === "string" && (/^data:image\//i.test(source) || /^https?:\/\//i.test(source) || /^blob:/i.test(source));
    console.debug(`[double-design] ${label} artwork URL validation`, validSource);
    if (!validSource) throw new Error(`Unsupported image format returned for the ${label} design.`);

    const load = (url) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(url);
      image.onerror = () => reject(new Error(`The ${label} artwork URL could not be loaded by the browser.`));
      image.src = url;
    });

    try {
      return await load(source);
    } catch (firstError) {
      console.debug(`[double-design] ${label} preload retry`, firstError.message);
      const retryUrl = /^https?:\/\//i.test(source)
        ? `${source}${source.includes("?") ? "&" : "?"}retry=${Date.now()}`
        : source;
      try {
        return await load(retryUrl);
      } catch (retryError) {
        console.error(`[double-design] ${label} rendering failure`, retryError);
        throw new Error(`Image failed to load for the ${label} design after retry: ${retryError.message}`);
      }
    }
  };

  const applyPreset =
    (preset) => {

      if (generationMode === "single") {
        setPrompt(
          preset.prompt
        );
      } else if (generationMode === "double") {
        setPrompt(preset.prompt);
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

      setPrompt((prev) => prev ? `${prev} ${transcript}` : transcript);

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
          couplePrompt
        );
      const cachedGeneration =
        readGenerationCache(cacheKey);

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
          formData.append("prompt", prompt);
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
