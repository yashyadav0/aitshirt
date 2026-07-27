import { useState } from "react";
import { Heart } from "lucide-react";

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
  productType,
  generationPreferences,
  setSuccessMessage,
  confirmedDesign,
  setConfirmedDesign,
  isConfirmed,
  setIsConfirmed
}) {
  const [hisSize, setHisSize] = useState("M");
  const [herSize, setHerSize] = useState("M");
  const [isProcessing, setIsProcessing] = useState(false);
  const sizes = ["S", "M", "L"];

  const showToast = (message) => {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(""), 2500);
  };

  const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load preview artwork."));
    image.src = src;
  });

  const createMockup = async (mockupSource, artworkSource, scale) => {
    const [mockup, artwork] = await Promise.all([loadImage(mockupSource), loadImage(artworkSource)]);
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const context = canvas.getContext("2d");
    context.drawImage(mockup, -60, -120, 920, 1040);
    const area = productType === "hoodie"
      ? { x: 144, y: 200, width: 512, height: 464 }
      : { x: 112, y: 184, width: 576, height: 496 };
    const ratio = artwork.naturalWidth / artwork.naturalHeight || 1;
    const areaRatio = area.width / area.height;
    const factor = (scale || 48) / 48;
    const width = (ratio > areaRatio ? area.width : area.height * ratio) * factor;
    const height = (ratio > areaRatio ? area.width / ratio : area.height) * factor;
    context.drawImage(artwork, area.x + (area.width - width) / 2, area.y + (area.height - height) / 2, width, height);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const uploadImage = async (blob, token) => {
    const formData = new FormData();
    formData.append("image", blob, "couple-design.png");
    const response = await API.post("/upload", formData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data.imageUrl;
  };

  const confirm = async () => {
    if (isProcessing || isConfirmed) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const [hisBlob, herBlob] = await Promise.all([
        createMockup(getMockup(productType, hisColor, hisSide), generatedHisImage, hisScale),
        createMockup(getMockup(productType, herColor, herSide), generatedHerImage, herScale)
      ]);
      const [hisDesignImage, herDesignImage] = await Promise.all([
        uploadImage(hisBlob, token),
        uploadImage(herBlob, token)
      ]);
      const design = {
        isCouple: true,
        generationMode: "couple",
        preferences: generationPreferences,
        productType,
        designType: "couple",
        hisDesignImage,
        herDesignImage,
        hisDesign: generatedHisImage,
        herDesign: generatedHerImage,
        couplePrompt,
        hisColor,
        herColor,
        hisSide,
        herSide,
        hisSize,
        herSize,
        isConfirmed: true
      };
      await API.post("/generation/save", design, { headers: { Authorization: `Bearer ${token}` } });
      setConfirmedDesign(design);
      setIsConfirmed(true);
      showToast("Couple design confirmed");
    } finally {
      setIsProcessing(false);
    }
  };

  const send = async (endpoint, message) => {
    if (!isConfirmed || isProcessing) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      await API.post(endpoint, { ...confirmedDesign, price: 699 }, { headers: { Authorization: `Bearer ${token}` } });
      showToast(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const sizePicker = (value, setValue, label) => (
    <div className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-4">
      <p className="mb-3 text-sm font-medium text-zinc-200">{label} size</p>
      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => <button key={size} onClick={() => setValue(size)} className={`min-h-11 rounded-xl border ${value === size ? "border-cyan-400 bg-cyan-400/10 text-white" : "border-[#3f3f46] text-zinc-400"}`}>{size}</button>)}
      </div>
    </div>
  );

  return <div className="mt-6">
    <div className="grid gap-3 sm:grid-cols-2">{sizePicker(hisSize, setHisSize, "His")}{sizePicker(herSize, setHerSize, "Her")}</div>
    <button onClick={confirm} disabled={isProcessing || isConfirmed} className="mt-4 w-full rounded-2xl bg-cyan-500 py-4 text-lg font-bold text-black disabled:opacity-50">{isConfirmed ? "Design Confirmed" : "Confirm Couple Design"}</button>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><button onClick={() => send("/cart/add", "Added to cart")} disabled={!isConfirmed || isProcessing} className="rounded-xl bg-[#252525] px-4 py-3 disabled:opacity-50">Add to cart</button><button onClick={() => send("/wishlist/add", "Added to wishlist")} disabled={!isConfirmed || isProcessing} className="flex items-center justify-center gap-2 rounded-xl bg-[#252525] px-4 py-3 disabled:opacity-50"><Heart size={18} /> Wishlist</button></div>
  </div>;
}
