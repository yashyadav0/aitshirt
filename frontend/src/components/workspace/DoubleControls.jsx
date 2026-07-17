import { getColorsForProductType } from "../../config/designPreferences";

export default function DoubleControls({ color, setColor, productType, frontSide, setFrontSide, backSide, setBackSide }) {
  const colors = getColorsForProductType(productType);
  return (
    <div className="mt-6 rounded-2xl border border-[#2f2f2f] bg-[#171717] p-4">
      <p className="mb-3 text-sm font-medium text-zinc-200">Garment Color</p>
      <div className="mb-4 flex gap-3">
        {colors.map((item) => <button key={item.id} onClick={() => setColor(item.id)} aria-label={item.label || item.id} className={`h-12 w-12 rounded-full border border-[#3f3f46] transition-all ${color === item.id ? "scale-105 ring-2 ring-white" : ""}`} style={{ backgroundColor: item.hex }} />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => setFrontSide(frontSide === "front" ? "back" : "front")} className="min-h-12 rounded-2xl bg-[#202020] text-sm font-medium text-zinc-200">Front Preview: {frontSide}</button>
        <button onClick={() => setBackSide(backSide === "back" ? "front" : "back")} className="min-h-12 rounded-2xl bg-[#202020] text-sm font-medium text-zinc-200">Back Preview: {backSide}</button>
      </div>
    </div>
  );
}
