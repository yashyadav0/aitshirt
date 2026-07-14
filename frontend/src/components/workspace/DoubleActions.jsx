import { useState } from "react";
import { Heart } from "lucide-react";

export default function DoubleActions({ frontImage, backImage, frontPrompt, backPrompt, color, productType, getMockup, API, generationPreferences, confirmedDesign, setConfirmedDesign, isConfirmed, setIsConfirmed, setSuccessMessage }) {
  const [size, setSize] = useState("M");
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = (message) => { setSuccessMessage(message); setTimeout(() => setSuccessMessage(""), 2500); };
  const makeMockup = async (side, design) => {
    const canvas = document.createElement("canvas"); canvas.width = 800; canvas.height = 800;
    const [mockup, artwork] = await Promise.all([getImage(getMockup(productType, color, side)), getImage(design)]);
    const ctx = canvas.getContext("2d"); ctx.drawImage(mockup, -60, -120, 920, 1040);
    const width = productType === "hoodie" ? 420 : 540; const x = (800 - width) / 2;
    ctx.drawImage(artwork, x, side === "front" ? 145 : 165, width, width);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };
  const getImage = (src) => new Promise((resolve, reject) => { const image = new Image(); image.crossOrigin = "anonymous"; image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
  const uploadBlob = async (blob, token) => { const form = new FormData(); form.append("image", blob); return (await API.post("/upload", form, { headers: { Authorization: `Bearer ${token}` } })).data.imageUrl; };
  const confirm = async () => {
    if (isProcessing || isConfirmed) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const [frontDesignImage, backDesignImage] = await Promise.all([uploadBlob(await makeMockup("front", frontImage), token), uploadBlob(await makeMockup("back", backImage), token)]);
      const design = { isCouple: false, generationMode: "double", preferences: generationPreferences, productType, designType: "double", designImage: frontDesignImage, frontDesignImage, backDesignImage, frontTransparentDesign: frontImage, backTransparentDesign: backImage, prompt: `Front: ${frontPrompt}\nBack: ${backPrompt}`, frontPrompt, backPrompt, color, selectedColor: color, size, side: "front", designScale: productType === "hoodie" ? 55 : 68, isConfirmed: true };
      await API.post("/generation/save", design, { headers: { Authorization: `Bearer ${token}` } });
      setConfirmedDesign(design); setIsConfirmed(true); toast("Double-sided design confirmed");
    } finally { setIsProcessing(false); }
  };
  const send = async (endpoint, message) => { if (!isConfirmed || isProcessing) return; setIsProcessing(true); try { const token = localStorage.getItem("token"); await API.post(endpoint, { ...confirmedDesign, price: 699 }, { headers: { Authorization: `Bearer ${token}` } }); toast(message); } finally { setIsProcessing(false); } };
  return <div className="mt-4 rounded-2xl border border-[#2f2f2f] bg-[#171717] p-4"><div className="mb-4 flex justify-center gap-2">{["S", "M", "L"].map((item) => <button key={item} onClick={() => setSize(item)} className={`h-10 w-12 rounded-xl border ${size === item ? "border-cyan-400 bg-cyan-400/10 text-white" : "border-[#3f3f46] text-zinc-400"}`}>{item}</button>)}</div><div className="grid gap-3 sm:grid-cols-3"><button onClick={confirm} disabled={isProcessing || isConfirmed} className="rounded-xl bg-cyan-500 px-4 py-3 font-medium text-black disabled:opacity-50">{isConfirmed ? "Confirmed" : "Confirm both sides"}</button><button onClick={() => send("/cart/add", "Added to cart")} disabled={!isConfirmed || isProcessing} className="rounded-xl bg-[#252525] px-4 py-3 disabled:opacity-50">Add to cart</button><button onClick={() => send("/wishlist/add", "Added to wishlist")} disabled={!isConfirmed || isProcessing} className="flex items-center justify-center gap-2 rounded-xl bg-[#252525] px-4 py-3 disabled:opacity-50"><Heart size={18} /> Wishlist</button></div></div>;
}
