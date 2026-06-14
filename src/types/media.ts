import type { MediaBucketName, MediaFile as DatabaseMediaFile } from "@/types/database";

export enum StorageBucket {
  RaffleImages = "raffle-images",
  PrizeImages = "prize-images",
  PlatformAssets = "platform-assets",
  Winners = "winners",
  Temporary = "temporary",
}

export type StorageBucketName = `${StorageBucket}`;

export type UploadPurpose =
  | "logo"
  | "favicon"
  | "banner"
  | "raffle-image"
  | "prize-image"
  | "winner-image"
  | "temporary";

export type AllowedImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export type ImageMetadata = {
  width: number | null;
  height: number | null;
  mimeType: AllowedImageMimeType | null;
};

export type MediaFile = DatabaseMediaFile;

export type UploadResult =
  | {
      ok: true;
      mediaFile: MediaFile;
    }
  | {
      ok: false;
      error: string;
    };

export type StorageValidationResult =
  | {
      ok: true;
      mimeType: AllowedImageMimeType;
    }
  | {
      ok: false;
      error: string;
    };

export type StorageBucketConfig = {
  bucket: StorageBucket;
  label: string;
  description: string;
  isPublic: boolean;
  maxSizeBytes: number;
  allowedMimeTypes: readonly AllowedImageMimeType[];
};

export type MediaFileInsert = {
  tenant_id: string;
  bucket_name: MediaBucketName;
  file_name: string;
  original_name: string | null;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string | null;
  width: number | null;
  height: number | null;
  uploaded_by: string;
};
