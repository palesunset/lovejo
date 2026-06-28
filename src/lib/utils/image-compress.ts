/** Matches Supabase bucket `file_size_limit` in 002_storage_policies.sql */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const MAX_DIMENSION = 1920;
const INITIAL_QUALITY = 0.85;
const MIN_QUALITY = 0.55;
const QUALITY_STEP = 0.08;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Try a different photo."));
    };
    img.src = url;
  });
}

function scaleDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Resizes and compresses photos before Supabase upload.
 * Keeps uploads under the storage bucket size limit.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (JPEG, PNG, or WebP).");
  }

  if (file.type === "image/gif") {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        "GIF is too large (max 10 MB). Try a shorter clip or export as JPEG.",
      );
    }
    return file;
  }

  if (file.size <= MAX_UPLOAD_BYTES && file.type === "image/jpeg") {
    const img = await loadImage(file);
    if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
      return file;
    }
  }

  const img = await loadImage(file);
  const { width, height } = scaleDimensions(img.width, img.height, MAX_DIMENSION);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Image compression is not supported in this browser.");
  }

  ctx.drawImage(img, 0, 0, width, height);

  let quality = INITIAL_QUALITY;
  let blob = await canvasToJpegBlob(canvas, quality);

  while (blob.size > MAX_UPLOAD_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      "Photo is still too large after compression. Try a smaller image.",
    );
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "memory";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
