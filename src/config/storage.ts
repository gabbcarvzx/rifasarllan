import { StorageBucket, type AllowedImageMimeType, type UploadPurpose } from "@/types/media";

export const BYTES_PER_MB = 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies readonly AllowedImageMimeType[];

export const BLOCKED_FILE_EXTENSIONS = [
  "bat",
  "cmd",
  "dll",
  "exe",
  "js",
  "mjs",
  "rar",
  "ts",
  "tsx",
  "zip",
] as const;

export const BLOCKED_MIME_TYPES = [
  "application/javascript",
  "application/octet-stream",
  "application/x-bat",
  "application/x-dosexec",
  "application/x-msdownload",
  "application/x-rar-compressed",
  "application/zip",
  "text/javascript",
  "text/x-typescript",
] as const;

export const STORAGE_BUCKETS = {
  [StorageBucket.RaffleImages]: {
    bucket: StorageBucket.RaffleImages,
    label: "Imagens de rifas",
    description: "Galerias e imagens principais de campanhas futuras.",
    isPublic: true,
    maxSizeBytes: 10 * BYTES_PER_MB,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  },
  [StorageBucket.PrizeImages]: {
    bucket: StorageBucket.PrizeImages,
    label: "Imagens de premios",
    description: "Fotos dos premios principais e secundarios.",
    isPublic: true,
    maxSizeBytes: 10 * BYTES_PER_MB,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  },
  [StorageBucket.PlatformAssets]: {
    bucket: StorageBucket.PlatformAssets,
    label: "Assets da plataforma",
    description: "Logo, banner principal e identidade visual do tenant.",
    isPublic: true,
    maxSizeBytes: 10 * BYTES_PER_MB,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  },
  [StorageBucket.Winners]: {
    bucket: StorageBucket.Winners,
    label: "Imagens de vencedores",
    description: "Assets publicos de resultados e vencedores.",
    isPublic: true,
    maxSizeBytes: 10 * BYTES_PER_MB,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  },
  [StorageBucket.Temporary]: {
    bucket: StorageBucket.Temporary,
    label: "Arquivos temporarios",
    description: "Uploads transitorios antes de vinculacao definitiva.",
    isPublic: false,
    maxSizeBytes: 10 * BYTES_PER_MB,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  },
} as const;

export const UPLOAD_PURPOSE_CONFIG: Record<
  UploadPurpose,
  {
    bucket: StorageBucket;
    maxSizeBytes: number;
    directory: string;
  }
> = {
  logo: {
    bucket: StorageBucket.PlatformAssets,
    maxSizeBytes: 5 * BYTES_PER_MB,
    directory: "logos",
  },
  banner: {
    bucket: StorageBucket.PlatformAssets,
    maxSizeBytes: 10 * BYTES_PER_MB,
    directory: "banners",
  },
  "raffle-image": {
    bucket: StorageBucket.RaffleImages,
    maxSizeBytes: 10 * BYTES_PER_MB,
    directory: "raffles",
  },
  "prize-image": {
    bucket: StorageBucket.PrizeImages,
    maxSizeBytes: 10 * BYTES_PER_MB,
    directory: "prizes",
  },
  "winner-image": {
    bucket: StorageBucket.Winners,
    maxSizeBytes: 10 * BYTES_PER_MB,
    directory: "winners",
  },
  temporary: {
    bucket: StorageBucket.Temporary,
    maxSizeBytes: 10 * BYTES_PER_MB,
    directory: "temporary",
  },
};

export const PUBLIC_STORAGE_BUCKETS = Object.values(STORAGE_BUCKETS)
  .filter((config) => config.isPublic)
  .map((config) => config.bucket);
