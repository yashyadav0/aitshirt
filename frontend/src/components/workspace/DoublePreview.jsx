export default function DoublePreview({ frontImage, backImage, getMockup, productType, color, isLoading = false }) {
  const placement = productType === "hoodie"
    ? { top: "47%", width: "52%" }
    : { top: "48%", width: "68%" };
  const card = (side, image) => (
    <section className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-3">
      <p className="mb-2 text-center text-sm font-medium text-zinc-300">{side} print</p>
      <div className="relative aspect-square overflow-hidden rounded-xl">
        {isLoading && !image ? <div className="h-full w-full animate-pulse bg-[#202020]" /> : <>
          <img src={getMockup(productType, color, side.toLowerCase())} alt={`${side} mockup`} className="h-full w-full object-cover" />
          {image && <img src={image} alt={`${side} generated artwork`} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain" style={placement} />}
        </>}
      </div>
    </section>
  );
  return <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">{card("Front", frontImage)}{card("Back", backImage)}</div>;
}
