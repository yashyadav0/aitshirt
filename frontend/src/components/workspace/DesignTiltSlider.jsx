export default function DesignTiltSlider({

  designTilt,
  setDesignTilt

}) {

  return (

    <div
      className="
        mt-3
      "
    >

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
        "
      >

        <label
          className="
            text-xs
            font-medium
            uppercase
            tracking-wide
            text-zinc-500
          "
        >

          Tilt

        </label>

        <span
          className="
            text-xs
            font-medium
            text-cyan-300
          "
        >

          {designTilt}°

        </span>

      </div>

      <input

        type="range"

        min="-30"

        max="30"

        value={designTilt}

        onChange={(e) =>
          setDesignTilt(
            parseInt(
              e.target.value,
              10
            )
          )
        }

        className="
          w-full
          h-2
          cursor-pointer
          appearance-none
          rounded-full
          bg-[#2f2f2f]
          accent-cyan-400
        "

        aria-label="Design tilt"
      />

    </div>
  );
}