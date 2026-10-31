import React, {
  useCallback,
  useState,
  useRef,
  useEffect
} from "react";
import {
  useLocation,
  useNavigate
} from "react-router-dom";

import DesignModePill
from "../components/workspace/DesignModePill";

import StyleChips
from "../components/workspace/StyleChips";

import PromptComposer
from "../components/workspace/PromptComposer";

import ResultToolbar
from "../components/workspace/ResultToolbar";

import API from "../api";

import {
  removeBackground
} from "@imgly/background-removal";

import {
  useAuth
} from "../auth/AuthContext";

import PreferenceChips
from "../components/workspace/PreferenceChips";

import useDesignPreferences
from "../hooks/useDesignPreferences";

import {
  normalizePreferences
} from "../config/designPreferences";

import GenerationLoader
from "../components/workspace/GenerationLoader";

import UsageIndicator
from "../components/workspace/UsageIndicator";

import {
  hasQuota
} from "../utils/quota";

import {
  showError
} from "../utils/toast";

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

import {
  getMockup as getStaticOrOverrideMockup
} from "../config/mockups";

import {
  History as HistoryIcon,
  Moon,
  Sun,
  Sparkles
} from "lucide-react";
import "./AIWorkspace.css";

function toWorkspaceHistoryItem(item) {
  const mode =
    item.designType
    || item.generationMode
    || (item.isCouple ? "couple" : item.frontDesignImage ? "double" : "single");

  return {
    ...item,
    id: item._id || item.id,
    mode,
    timestamp: item.timestamp || new Date(item.createdAt || Date.now()).toLocaleString(),
    prompt: item.prompt || item.couplePrompt || item.sharedPrompt || "",
    image:
      item.transparentDesign
      || item.designImage
      || item.frontTransparentDesign
      || item.frontDesignImage
      || item.hisDesign
      || item.hisDesignImage
      || "",
    frontImage:
      item.frontTransparentDesign
      || item.frontDesignImage
      || "",
    backImage:
      item.backTransparentDesign
      || item.backDesignImage
      || "",
    hisImage:
      item.hisDesign
      || item.hisDesignImage
      || "",
    herImage:
      item.herDesign
      || item.herDesignImage
      || ""
  };
}

export default function AIWorkspace({
  workspaceTheme,
  setWorkspaceTheme
}) {

  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    profile,
    refreshUser
  } = useAuth();

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

  const [selectedStyles,
    setSelectedStyles] =
    useState([]);

  const [isRefining,
    setIsRefining] =
    useState(false);

  // =====================================
  // SESSION & GENERATION HISTORY STATES
  // =====================================
  const [generationHistory, setGenerationHistory] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeGenerationId, setActiveGenerationId] = useState(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const composerRef =
    useRef(null);

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



  // =====================================
  // DESIGN TRANSFORM STATES (drag/resize/rotate)
  // =====================================

  const [singleTransform,
    setSingleTransform] =
    useState(null);

  const [frontTransform,
    setFrontTransform] =
    useState(null);

  const [backTransform,
    setBackTransform] =
    useState(null);

  const [hisTransform,
    setHisTransform] =
    useState(null);

  const [herTransform,
    setHerTransform] =
    useState(null);


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
    const fetchGenerationHistory = async () => {
      try {
        const res = await API.get("/generation/my-generations");
        setGenerationHistory(
          res.data.map(toWorkspaceHistoryItem)
        );
      } catch (err) {
        console.log(err);
        showError("Failed to fetch generation history");
      }
    };

    fetchGenerationHistory();
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
  }, []);

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

  const getMockup = (productType, color, side) =>
    getStaticOrOverrideMockup(productType, color, side);

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

        const authUser =
          user || profile;

        if (
          authUser &&
          !hasQuota(authUser)
        ) {

          setLoading(false);

          showError(
            "You've used all your prompts. Upgrade your plan or wait for the weekly reset."
          );

          return;
        }

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
            "Generating design..."
          );
        } else if (
          activeMode === "double"
        ) {
          setGenerationStep(
            "Generating double-sided design..."
          );
        } else {
          setGenerationStep(
            "Generating couple design..."
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

        formData.append(
          "styles",
          JSON.stringify(
            selectedStyles
          )
        );

        if (
          activeMode === "single" ||
          activeMode === "double"
        ) {
          const generationPrompt =
            activeMode === "single"
              ? `${prompt}\n\nOUTPUT ONLY THE PRINT GRAPHIC: create a single isolated flat apparel-print artwork on a transparent background. Do not draw, include, frame, or mock up a T-shirt, garment, clothing, person, mannequin, fabric, folds, or product scene. If the prompt mentions a shirt, interpret it only as the intended print surface, never as an object to draw.`
              : prompt;

          formData.append(
            "prompt",
            generationPrompt
          );
        } else {
          formData.append(
            "prompt",
            couplePrompt
          );
        }

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

        if (activeMode === "single") {
          setGeneratedImage(res.data.imageUrl);
        } else if (activeMode === "double") {
          setGeneratedFrontImage(res.data.frontImage);
          setGeneratedBackImage(res.data.backImage);
        } else {
          setGeneratedHisImage(res.data.hisImage);
          setGeneratedHerImage(res.data.herImage);
        }

        setIsRefining(false);

        if (res.data?.quota) {
          refreshUser();
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

        let finalSingle = "";
        let finalFront = "";
        let finalBack = "";
        let finalHis = "";
        let finalHer = "";

        if (
          activeMode === "single"
        ) {
          finalSingle = res.data.imageUrl;

          window.setTimeout(() => {
            void (async () => {
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

            finalSingle = uploadRes.data.imageUrl;
            setGeneratedImage(finalSingle);

          } catch (bgErr) {
            console.log(bgErr);
            finalSingle = res.data.imageUrl;
            setGeneratedImage(finalSingle);
          }

            })();
          }, 0);
        }

        else if (
          activeMode === "double"
        ) {
          finalFront = res.data.frontImage;
          finalBack = res.data.backImage;

          window.setTimeout(() => {
            void (async () => {
          try {
            const frontArtwork =
              await processGeneratedImage(
                res.data.frontImage,
                token
              );

            if (frontArtwork) {
              finalFront = frontArtwork;
              setGeneratedFrontImage(finalFront);
            }

            const backArtwork =
              await processGeneratedImage(
                res.data.backImage,
                token
              );

            if (backArtwork) {
              finalBack = backArtwork;
              setGeneratedBackImage(finalBack);
            }

          } catch (bgErr) {
            console.log(bgErr);
          }
            })();
          }, 0);
        }

        else {
          finalHis = res.data.hisImage;
          finalHer = res.data.herImage;

          window.setTimeout(() => {
            void (async () => {
          try {
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

            finalHis = hisUploadRes.data.imageUrl;
            setGeneratedHisImage(finalHis);

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

            finalHer = herUploadRes.data.imageUrl;
            setGeneratedHerImage(finalHer);

          } catch (bgErr) {
            console.log(bgErr);
            finalHis = res.data.hisImage;
            finalHer = res.data.herImage;
            setGeneratedHisImage(finalHis);
            setGeneratedHerImage(finalHer);
          }
            })();
          }, 0);
        }

        // =====================================
        // RECORD SESSION IN HISTORY
        // =====================================
        const currentPromptText = activeMode === "couple" ? couplePrompt : prompt;
        const historyData = {
          generationMode: activeMode,
          designType: activeMode,
          productType: responsePreferences.productType,
          selectedColor: responsePreferences.selectedColor || responsePreferences.color,
          color: responsePreferences.selectedColor || responsePreferences.color,
          preferences: responsePreferences,
          prompt: currentPromptText || "Custom Generation",
          designImage: finalSingle || finalFront || finalHis,
          transparentDesign: finalSingle || "",
          frontDesignImage: finalFront || "",
          backDesignImage: finalBack || "",
          frontTransparentDesign: finalFront || "",
          backTransparentDesign: finalBack || "",
          isCouple: activeMode === "couple",
          hisDesign: finalHis || "",
          herDesign: finalHer || "",
          hisDesignImage: finalHis || "",
          herDesignImage: finalHer || "",
          sharedPrompt: activeMode === "couple" ? currentPromptText : ""
        };
        let savedGeneration;

        try {
          const historyRes = await API.post(
            "/generation/save",
            historyData
          );
          savedGeneration = historyRes.data.generation;
        } catch (historyErr) {
          console.log("GENERATION HISTORY SAVE ERROR:", historyErr);
          showError("Design generated, but could not save it to history.");
        }

        const newSessionItem = toWorkspaceHistoryItem(
          savedGeneration || {
            ...historyData,
            id: Date.now().toString()
          }
        );

        setGenerationHistory((prev) => [
          newSessionItem,
          ...prev.filter((item) => item.id !== newSessionItem.id)
        ]);
        setActiveSessionId(newSessionItem.id);
        setActiveGenerationId(savedGeneration?._id || null);

      } catch (err) {
        console.log("GENERATION ERROR:", err);

        const status =
          err?.response?.status;

        if (status === 409) {
          showError(
            err?.response?.data?.error ||
            "You've reached your prompt limit."
          );
        } else if (
          err?.response?.data?.error
        ) {
          showError(
            err.response.data.error
          );
        } else if (status === 500) {
          showError("Generation failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

  const handleRegenerate =
    () => {
      handleGenerate();
    };

  const toggleStyle =
    (id) => {
      setSelectedStyles((prev) =>
        prev.includes(id)
          ? prev.filter((s) => s !== id)
          : [...prev, id]
      );
    };

  const handleStartOver =
    () => {
      setGeneratedImage("");
      setGeneratedHisImage("");
      setGeneratedHerImage("");
      setGeneratedFrontImage("");
      setGeneratedBackImage("");
      setConfirmedDesign(null);
      setIsConfirmed(false);
      setSingleTransform(null);
      setFrontTransform(null);
      setBackTransform(null);
      setHisTransform(null);
      setHerTransform(null);
      setPrompt("");
      setCouplePrompt("");
      setReferenceImages([]);
      setSelectedStyles([]);
      setIsRefining(false);
      setGenerationStep("");
      setActiveSessionId(null);
      setActiveGenerationId(null);
    };

  const handleRefine =
    async () => {
      try {
        const targetImages =
          generationMode === "couple"
            ? [generatedHisImage, generatedHerImage]
            : generationMode === "double"
              ? [generatedFrontImage, generatedBackImage]
              : [generatedImage];
        const imageFiles = await Promise.all(
          targetImages
            .filter(Boolean)
            .map(async (imageUrl, index) => {
              const blob = await fetch(imageUrl).then((response) => response.blob());
              return new File(
                [blob],
                `current-design-${index + 1}.png`,
                { type: blob.type || "image/png" }
              );
            })
        );

        if (imageFiles.length === 0) return;

        setReferenceImages(imageFiles);
        if (generationMode === "couple") {
          setCouplePrompt("");
        } else {
          setPrompt("");
        }
        setIsRefining(true);

        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(
          () => composerRef.current?.focus(),
          300
        );
      } catch (err) {
        console.log(err);
        showError("Could not load the design to refine.");
      }
    };

  // Restore session from history
  const handleSelectHistorySession = useCallback((session) => {
    setActiveSessionId(session.id);
    setActiveGenerationId(session._id || null);
    setGenerationMode(session.mode);
    if (session.mode === "couple") {
      setCouplePrompt(session.prompt);
    } else {
      setPrompt(session.prompt);
    }
    setGeneratedImage(session.image || "");
    setGeneratedFrontImage(session.frontImage || "");
    setGeneratedBackImage(session.backImage || "");
    setGeneratedHisImage(session.hisImage || "");
    setGeneratedHerImage(session.herImage || "");
    const restoredPreferences = normalizePreferences(
      session.preferences || {
        ...preferences,
        designType: session.mode
      }
    );
    setActiveGenerationPreferences(restoredPreferences);
    setPrefDesignType(session.mode);
    setPrefProductType(restoredPreferences.productType);
    setPrefColor(restoredPreferences.selectedColor || restoredPreferences.color);
    setSelectedColor(restoredPreferences.selectedColor || restoredPreferences.color);
    setProductType(restoredPreferences.productType);
    setHisColor(restoredPreferences.selectedColor || restoredPreferences.color);
    setHerColor(restoredPreferences.selectedColor || restoredPreferences.color);
    setConfirmedDesign(null);
    setIsConfirmed(false);
  }, [
    preferences,
    setPrefColor,
    setPrefDesignType,
    setPrefProductType
  ]);

  useEffect(() => {
    const historyGeneration = location.state?.historyGeneration;
    if (!historyGeneration) return;

    handleSelectHistorySession(
      toWorkspaceHistoryItem(historyGeneration)
    );
    navigate("/workspace", {
      replace: true,
      state: null
    });
  }, [location.state, navigate, handleSelectHistorySession]);

  const isCouple =
    generationMode === "couple";

  const composerValue =
    isCouple ? couplePrompt : prompt;

  const setComposerValue =
    isCouple ? setCouplePrompt : setPrompt;

  const toggleWorkspaceTheme = () => {
    setWorkspaceTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("aiWorkspaceTheme", nextTheme);
      return nextTheme;
    });
  };

  return (

    <div
      data-workspace-theme={workspaceTheme}
      className="
        ai-workspace
        min-h-screen
        bg-[#0b0b0b]
        text-white
        px-4
        pb-44
        pt-20
        md:px-8
        md:pt-8
        relative
      "
    >

      <button
        type="button"
        onClick={toggleWorkspaceTheme}
        aria-label={`Switch to ${workspaceTheme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${workspaceTheme === "dark" ? "light" : "dark"} mode`}
        className="fixed top-6 right-6 z-40 flex h-10 items-center gap-2 rounded-full border border-[#2f2f2f] bg-[#171717] px-4 text-xs font-medium text-zinc-300 shadow-xl transition hover:text-white"
      >
        {workspaceTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        <span>{workspaceTheme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>

      {/* HISTORY TOGGLE BUTTON */}
      {generationHistory.length > 0 && (
        <button
          onClick={() => setShowHistorySidebar(!showHistorySidebar)}
          className="fixed top-6 right-44 z-40 flex items-center gap-2 rounded-full border border-[#2f2f2f] bg-[#171717] px-4 py-2 text-xs font-medium text-zinc-300 shadow-xl transition hover:bg-[#222] hover:text-white max-sm:top-16 max-sm:right-4"
        >
          <HistoryIcon size={14} />
          <span>Session History ({generationHistory.length})</span>
        </button>
      )}

      {/* HISTORY SIDEBAR DRAWER */}
      {showHistorySidebar && generationHistory.length > 0 && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-[#2f2f2f] bg-[#121212] p-4 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#2f2f2f]">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <HistoryIcon size={16} />
              <span>Generation History</span>
            </div>
            <button
              onClick={() => setShowHistorySidebar(false)}
              className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-[#1f1f1f]"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mt-3 flex flex-col gap-2.5 pr-1">
            {generationHistory.map((item) => {
              const isActive = item.id === activeSessionId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleSelectHistorySession(item);
                    setShowHistorySidebar(false);
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border ${
                    isActive
                      ? "border-cyan-500/50 bg-[#1e1e1e]"
                      : "border-[#222] bg-[#171717] hover:bg-[#1a1a1a]"
                  }`}
                >
                  <img
                    src={item.image || item.frontImage || item.hisImage}
                    alt="History thumbnail"
                    className="w-11 h-11 object-cover rounded-lg bg-black shrink-0 border border-[#2f2f2f]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">{item.prompt}</p>
                    <span className="text-[10px] text-zinc-500 uppercase">{item.mode} • {item.timestamp}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                : "flex min-h-[calc(100vh-280px)] flex-col justify-center"
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

            <DesignModePill
              preferences={preferences}
              setProductType={setPrefProductType}
              setDesignType={setPrefDesignType}
              onDesignTypeChange={
                handlePreferenceDesignTypeChange
              }
              disabled={loading}
            />

            {
              !hasGenerated && (
                <h1
                  className="
                    mt-10
                    sm:mt-14
                    mb-8
                    text-3xl
                    sm:text-4xl
                    md:text-5xl
                    font-semibold
                    tracking-tight
                    text-white
                    leading-tight
                  "
                >
                  Imagine your dreams <span aria-hidden="true">⭐</span>
                </h1>
              )
            }

            {
              !hasGenerated && (
                <div className="mt-5">
                  <StyleChips
                    selected={selectedStyles}
                    onToggle={toggleStyle}
                    disabled={loading}
                  />
                </div>
              )
            }

            {
              !hasGenerated && (
                <div
                  className="
                    mt-4
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
                        type="button"
                        onClick={() => applyPreset(preset)}
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
              )
            }

          </div>

        </header>

        {
          hasGenerated
          && resolvedPreferences && (
            <>
              <PreferenceChips
                preferences={
                  resolvedPreferences
                }
                loading={loading}
              />

              <ResultToolbar
                onRefine={handleRefine}
                onRegenerate={
                  handleRegenerate
                }
                onStartOver={
                  handleStartOver
                }
                loading={loading}
              />
            </>
          )
        }


        {/* SINGLE */}

        {
          activeResultMode === "single"
          &&
          generatedImage
          && (

            <>

              <div className="workspace-single-result">
                <div
                  id="workspace-tshirt-preview"
                  className="workspace-single-preview-layout"
                >
                  <SinglePreview
                    generatedImage={generatedImage}
                    mockupRef={mockupRef}
                    getMockup={getMockup}
                    productType={activeResultProductType}
                    selectedColor={resolvedPreferences.selectedColor}
                    designTransform={singleTransform}
                    onDesignTransformChange={setSingleTransform}
                  />

                  <SingleControls
                    selectedColor={resolvedPreferences.selectedColor}
                    setSelectedColor={setSelectedColor}
                    productType={resolvedPreferences.productType}
                    setPreferenceColor={setPrefColor}
                  />
                </div>

              <SingleActions

                generationId={activeGenerationId}

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

                setSelectedSide={
                  setSelectedSide
                }

                designTransform={singleTransform}

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

                onEditWithPrompt={
                  handleRefine
                }

                onReposition={() => {
                  document
                    .getElementById("workspace-tshirt-preview")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center"
                    });
                  setSuccessMessage(
                    "Drag the artwork on the mockup to reposition it."
                  );
                }}
              />
              </div>

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

  hisTransform={hisTransform}
  onHisTransformChange={setHisTransform}

  herTransform={herTransform}
  onHerTransformChange={setHerTransform}

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

                generationId={activeGenerationId}

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

                hisTransform={hisTransform}
                herTransform={herTransform}

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

                frontTransform={frontTransform}
                onFrontTransformChange={setFrontTransform}

                backTransform={backTransform}
                onBackTransformChange={setBackTransform}
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
              />


              <DoubleSideActions

                generationId={activeGenerationId}

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

                frontTransform={frontTransform}
                backTransform={backTransform}

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

        <div className="workspace-composer-dock fixed inset-x-0 bottom-0 z-30 border-t border-[#2f2f2f] bg-[#0b0b0b]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:left-[280px] md:px-8">
          <div className="mx-auto max-w-4xl">
            {
              loading && (
                <GenerationLoader
                  generationStep={generationStep}
                />
              )
            }
            <PromptComposer
              value={composerValue}
              onChange={setComposerValue}
              onSubmit={() => handleGenerate()}
              loading={loading}
              placeholder={
                isRefining
                  ? "Describe what to change..."
                  : "Ask anything"
              }
              referenceImages={referenceImages}
              setReferenceImages={setReferenceImages}
              isListening={isListening}
              onMic={startListening}
              inputRef={composerRef}
            />
            <div className="mt-2 flex justify-center">
              <UsageIndicator user={user || profile} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}