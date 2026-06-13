import {
  ALLOWED_IMAGE_MIME_TYPES,
  BLOCKED_FILE_EXTENSIONS,
  BLOCKED_MIME_TYPES,
  UPLOAD_PURPOSE_CONFIG,
} from "@/config/storage";
import type {
  AllowedImageMimeType,
  StorageValidationResult,
  UploadPurpose,
} from "@/types/media";

const mimeBySignature: Array<{
  mimeType: AllowedImageMimeType;
  matches: (bytes: Uint8Array) => boolean;
}> = [
  {
    mimeType: "image/jpeg",
    matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    mimeType: "image/png",
    matches: (bytes) =>
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  {
    mimeType: "image/webp",
    matches: (bytes) =>
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
  },
];

export function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

export function isAllowedImageMimeType(
  mimeType: string,
): mimeType is AllowedImageMimeType {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType);
}

export function extensionFromMimeType(mimeType: AllowedImageMimeType) {
  const extensionMap: Record<AllowedImageMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return extensionMap[mimeType];
}

export async function readFileBytes(file: File, byteLength = 64) {
  return new Uint8Array(await file.slice(0, byteLength).arrayBuffer());
}

export function detectImageMimeType(bytes: Uint8Array) {
  return mimeBySignature.find((signature) => signature.matches(bytes))?.mimeType ?? null;
}

export async function validateStorageFile(
  file: File,
  purpose: UploadPurpose,
): Promise<StorageValidationResult> {
  const config = UPLOAD_PURPOSE_CONFIG[purpose];
  const extension = getFileExtension(file.name);

  if (!file.size || file.size <= 0) {
    return { ok: false, error: "O arquivo esta vazio." };
  }

  if (file.size > config.maxSizeBytes) {
    return {
      ok: false,
      error: `O arquivo excede o limite de ${Math.round(config.maxSizeBytes / 1024 / 1024)} MB.`,
    };
  }

  if ((BLOCKED_FILE_EXTENSIONS as readonly string[]).includes(extension)) {
    return { ok: false, error: "Este tipo de arquivo nao e permitido." };
  }

  if ((BLOCKED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: "O MIME type informado nao e permitido." };
  }

  if (!isAllowedImageMimeType(file.type)) {
    return {
      ok: false,
      error: "Envie uma imagem JPG, JPEG, PNG ou WEBP.",
    };
  }

  const detectedMimeType = detectImageMimeType(await readFileBytes(file));

  if (!detectedMimeType) {
    return {
      ok: false,
      error: "Nao foi possivel validar a assinatura real da imagem.",
    };
  }

  if (detectedMimeType !== file.type) {
    return {
      ok: false,
      error: "O conteudo do arquivo nao corresponde ao MIME type informado.",
    };
  }

  return { ok: true, mimeType: detectedMimeType };
}
