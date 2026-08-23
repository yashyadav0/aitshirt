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

import {
  useAuth
} from "../auth/AuthContext";

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

import UsageIndicator
from "../components/workspace/UsageIndicator";

import {
  hasQuota
} from "../utils/quota";

import {
  showError
} from "../utils/toast";

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

import {
  getMockup as getStaticOrOverrideMockup
} from "../config/mockups";

export default function AIWorkspace() {

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
  // Delegate to config/mockups.js which layers localStorage overrides
  // on top of the static imports. When no override exists, behavior is
  // identical to the original inlined implementation.
  const getMockup = (productType, color, side) =>
    getStaticOrOverrideMockup(productType, color, side);


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

        // =====================================
        // CLIENT-SIDE QUOTA PRE-CHECK
        // =====================================

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


        // =====================================
        // SYNC QUOTA FROM RESPONSE
        // =====================================

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
                <div className="flex items-center gap-3">
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

                  <UsageIndicator user={user || profile} />
                </div>

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

                designTransform={singleTransform}
                onDesignTransformChange={setSingleTransform}
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

      </div>

    </div>
  );
}
