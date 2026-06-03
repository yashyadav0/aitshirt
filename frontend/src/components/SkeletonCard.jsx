export default function SkeletonCard() {

  return (

    <div
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        overflow-hidden
        animate-pulse
      "
    >

      {/* Image */}
      <div
        className="
          h-64
          bg-zinc-800
        "
      />

      {/* Content */}
      <div className="p-5">

        <div
          className="
            h-4
            bg-zinc-800
            rounded
            mb-3
          "
        />

        <div
          className="
            h-4
            bg-zinc-800
            rounded
            w-2/3
            mb-5
          "
        />

        <div
          className="
            h-10
            bg-zinc-800
            rounded-xl
          "
        />

      </div>

    </div>
  );
}