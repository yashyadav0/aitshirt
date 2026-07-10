async function optimizeReferenceFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = new Image();

    const loaded = new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    image.src = imageUrl;
    await loaded;

    const maxSize = 1600;
    const scale = Math.min(
      1,
      maxSize / Math.max(image.width || 1, image.height || 1)
    );

    const width = Math.max(1, Math.round((image.width || 1) * scale));
    const height = Math.max(1, Math.round((image.height || 1) * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.88)
    );

    if (!blob) {
      return file;
    }

    return new File(
      [blob],
      file.name.replace(/\.[^.]+$/, "") + ".webp",
      {
        type: "image/webp",
        lastModified: file.lastModified
      }
    );
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function ReferenceUploader({

  referenceImages,
  setReferenceImages

}) {

  return (

    <>
      <label
        className="
          w-full
          block
          bg-[#101010]
          rounded-2xl
          px-4
          py-3
          mb-3
          border
          border-[#2f2f2f]
          cursor-pointer
          text-sm
          text-zinc-400
          transition
          hover:text-white
          hover:border-[#3f3f46]
        "
      >

        <input

          type="file"

          multiple

          hidden

          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            const optimized = await Promise.all(
              files.map((file) => optimizeReferenceFile(file))
            );
            setReferenceImages(optimized);
          }}
        />

        {

          referenceImages.length > 0

            ? `${referenceImages.length} files selected`

            : "Upload Image"
        }

      </label>


      {
        referenceImages.length > 0 && (

          <div
            className="
              flex
              gap-3
              overflow-x-auto
              mb-5
            "
          >

            {
              referenceImages.map(
                (file, index) => (

                    <img

                    key={index}

                    src={
                      URL.createObjectURL(
                        file
                      )
                    }

                    alt="preview"

                    className="
                      w-24
                      h-24
                      object-contain
                      bg-[#0f0f0f]
                      rounded-xl
                      border
                      border-[#2f2f2f]
                      flex-shrink-0
                    "
                  />
                )
              )
            }

          </div>
        )
      }
    </>
  );
}
