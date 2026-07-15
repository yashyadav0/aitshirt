import { removeBackground } from "@imgly/background-removal";

export class ArtworkPipelineError extends Error {
  constructor(stage, message, cause) {
    super(message);
    this.name = "ArtworkPipelineError";
    this.stage = stage;
    this.cause = cause;
  }
}

const delay = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function withTimeout(work, milliseconds, message) {
  let timeoutId;
  try {
    return await Promise.race([
      work,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error(message)), milliseconds);
      })
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

const isSupportedSource = (source) =>
  typeof source === "string"
  && (/^data:image\//i.test(source) || /^https?:\/\//i.test(source) || /^blob:/i.test(source));

export async function preloadArtwork(source, { retries = 1, label = "artwork" } = {}) {
  if (!isSupportedSource(source)) {
    throw new ArtworkPipelineError("validation", `The ${label} response did not contain a supported image source.`);
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const imageSource = attempt > 0 && /^https?:\/\//i.test(source)
        ? `${source}${source.includes("?") ? "&" : "?"}renderRetry=${Date.now()}`
        : source;
      await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = () => reject(new Error("Browser failed to decode the image."));
        image.src = imageSource;
      });
      return imageSource;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await delay(350 * (attempt + 1));
    }
  }

  throw new ArtworkPipelineError("render", `The ${label} was generated but could not be loaded for rendering.`, lastError);
}

async function fetchArtworkBlob(source, label) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) throw new Error(`Image download returned HTTP ${response.status}.`);
      const blob = await response.blob();
      if (!blob.size || !blob.type.startsWith("image/")) throw new Error("Image download did not return image data.");
      return blob;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await delay(350);
    }
  }
  throw new ArtworkPipelineError("download", `Unable to download the generated ${label}.`, lastError);
}

async function uploadArtworkBlob(api, blob, token, label) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const formData = new FormData();
      formData.append("image", blob, `${label}.png`);
      const response = await api.post("/upload", formData, { headers: { Authorization: `Bearer ${token}` } });
      const imageUrl = response.data?.imageUrl;
      if (!isSupportedSource(imageUrl)) throw new Error("Storage did not return a usable image URL.");
      return imageUrl;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await delay(500);
    }
  }
  throw new ArtworkPipelineError("upload", `Unable to store the processed ${label}.`, lastError);
}

export async function prepareArtwork({ source, api, token, label, onStep }) {
  const renderSource = await preloadArtwork(source, { label });
  onStep?.(`Preparing ${label}...`);

  try {
    const sourceBlob = await fetchArtworkBlob(renderSource, label);
    onStep?.(`Removing ${label} background...`);
    const result = await withTimeout(
      removeBackground(sourceBlob),
      30000,
      `Background removal timed out for the ${label}.`
    );
    const transparentBlob = result instanceof Blob ? result : new Blob([result], { type: "image/png" });
    if (!transparentBlob.size) throw new Error("Background removal returned an empty image.");

    onStep?.(`Saving ${label}...`);
    const uploadedUrl = await uploadArtworkBlob(api, transparentBlob, token, label);
    const renderUrl = await preloadArtwork(uploadedUrl, { label });
    return { url: renderUrl, backgroundRemoved: true };
  } catch (error) {
    // Never discard a valid generation because processing/storage is temporarily unavailable.
    console.warn(`[artwork-pipeline] ${label} post-processing fallback`, error);
    const fallbackUrl = await preloadArtwork(renderSource, { label });
    return { url: fallbackUrl, backgroundRemoved: false, processingError: error };
  }
}
