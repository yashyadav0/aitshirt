import API from "../../api";
import { prepareArtwork } from "../../utils/artworkPipeline";

// Compatibility wrapper for existing callers. All generated artwork now uses
// the same preloading, processing, upload, and fallback behaviour.
export default async function processGeneratedImage(imageUrl, token, options = {}) {
  const result = await prepareArtwork({
    source: imageUrl,
    api: API,
    token,
    label: options.label || "generated artwork",
    onStep: options.onStep
  });

  return result.url;
}
