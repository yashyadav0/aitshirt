import { useEffect, useMemo, useState } from "react";

const MAX_REFERENCE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);

export default function ReferenceUploader({
  referenceImages,
  setReferenceImages
}) {
  const [uploadError, setUploadError] = useState("");

  // Object URLs are created once per selected file and revoked when the
  // selection changes, preventing preview leaks and unnecessary re-renders.
  const previews = useMemo(
    () => referenceImages.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    })),
    [referenceImages]
  );

  useEffect(() => () => {
    previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    const invalidType = files.find((file) => !SUPPORTED_TYPES.has(file.type));
    const tooLarge = files.find((file) => file.size > MAX_REFERENCE_BYTES);

    if (invalidType) {
      setUploadError("Use a PNG, JPG, or WebP reference image.");
      event.target.value = "";
      return;
    }

    if (tooLarge) {
      setUploadError(`"${tooLarge.name}" is larger than 5 MB. Choose a smaller reference image.`);
      event.target.value = "";
      return;
    }

    setUploadError("");
    // Keep the original bytes and transparency. Reference images guide the
    // model only; no raw reference image is ever used as the final artwork.
    setReferenceImages(files);
    event.target.value = "";
  };

  return (
    <>
      <label
        className="
          w-full block bg-[#101010] rounded-2xl px-4 py-3 mb-3 border
          border-[#2f2f2f] cursor-pointer text-sm text-zinc-400 transition
          hover:text-white hover:border-[#3f3f46]
        "
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={handleFiles}
        />

        {referenceImages.length > 0
          ? `${referenceImages.length} reference image${referenceImages.length === 1 ? "" : "s"} selected`
          : "Upload Reference Image"}
      </label>

      {uploadError && (
        <p className="-mt-2 mb-3 text-xs text-red-300" role="alert">
          {uploadError}
        </p>
      )}

      {previews.length > 0 && (
        <div className="flex gap-3 overflow-x-auto mb-5">
          {previews.map(({ file, url }) => (
            <img
              key={`${file.name}:${file.size}:${file.lastModified}`}
              src={url}
              alt={`Reference: ${file.name}`}
              className="w-24 h-24 object-contain bg-[#0f0f0f] rounded-xl border border-[#2f2f2f] flex-shrink-0"
            />
          ))}
        </div>
      )}

      <p className="-mt-2 mb-4 text-xs leading-5 text-zinc-500">
        Your upload guides the AI; only newly generated artwork is placed on the apparel.
      </p>
    </>
  );
}
