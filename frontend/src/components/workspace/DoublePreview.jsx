export default function DoublePreview({ frontImage, backImage, getMockup, productType, color, isLoading = false }) {
  // A fixed print zone keeps every design centered and oversized regardless of
  // the source image dimensions. The artwork itself retains its aspect ratio.
  const printArea = productType === "hoodie"
    ? { left: "18%", top: "25%", width: "64%", height: "58%" }
    : { left: "14%", top: "23%", width: "72%", height: "62%" };
  const card = (side, image) => (
    <section className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-3">
      <p className="mb-2 text-center text-sm font-medium text-zinc-300">{side} print</p>
      <div className="relative aspect-square overflow-hidden rounded-xl">
        {isLoading && !image ? <div className="h-full w-full animate-pulse bg-[#202020]" /> : <>
          <img src={getMockup(productType, color, side.toLowerCase())} alt={`${side} mockup`} className="h-full w-full object-cover" />
          {image && <div className="absolute overflow-hidden" style={printArea}>
            <img src={image} alt={`${side} generated artwork`} className="h-full w-full object-contain" />
          </div>}
        </>}
      </div>
    </section>
  );
  return <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">{card("Front", frontImage)}{card("Back", backImage)}</div>;
}
