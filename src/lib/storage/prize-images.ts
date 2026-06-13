import { randomUUID } from "node:crypto";
import { normalizeSlug } from "@/lib/slug";
import { getImageMetadata } from "@/lib/storage/image-processing";
import { getPublicStorageUrl } from "@/lib/storage/urls";
import {
  extensionFromMimeType,
  getFileExtension,
  validateStorageFile,
} from "@/lib/storage/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StorageBucket } from "@/types/media";
import type { AllowedImageMimeType, UploadResult } from "@/types/media";

function getBaseFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return normalizeSlug(withoutExtension) || "premio";
}

function extensionMatchesMimeType(extension: string, mimeType: AllowedImageMimeType) {
  if (mimeType === "image/jpeg") {
    return extension === "jpg" || extension === "jpeg";
  }

  if (mimeType === "image/png") {
    return extension === "png";
  }

  return extension === "webp";
}

function getSafeExtension(originalName: string, mimeType: AllowedImageMimeType) {
  const originalExtension = getFileExtension(originalName);

  if (extensionMatchesMimeType(originalExtension, mimeType)) {
    return originalExtension;
  }

  return extensionFromMimeType(mimeType);
}

function buildStoredFileName(originalName: string, mimeType: AllowedImageMimeType) {
  return `${getBaseFileName(originalName)}-${randomUUID()}.${getSafeExtension(
    originalName,
    mimeType,
  )}`;
}

export function buildPrizeImageStoragePath({
  tenantId,
  raffleId,
  prizeId,
  fileName,
}: {
  tenantId: string;
  raffleId: string;
  prizeId: string;
  fileName: string;
}) {
  return `${tenantId}/${raffleId}/${prizeId}/${fileName}`;
}

export async function uploadPrizeImageFile({
  file,
  tenantId,
  raffleId,
  prizeId,
  uploadedBy,
}: {
  file: File;
  tenantId: string;
  raffleId: string;
  prizeId: string;
  uploadedBy: string;
}): Promise<UploadResult> {
  const validation = await validateStorageFile(file, "prize-image");

  if (!validation.ok) {
    return validation;
  }

  const fileName = buildStoredFileName(file.name, validation.mimeType);
  const storagePath = buildPrizeImageStoragePath({
    tenantId,
    raffleId,
    prizeId,
    fileName,
  });
  const metadata = await getImageMetadata(file);
  const supabase = await createSupabaseServerClient();

  const { error: uploadError } = await supabase.storage
    .from(StorageBucket.PrizeImages)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      error: "Nao foi possivel enviar a imagem do premio para o Storage.",
    };
  }

  const publicUrl = await getPublicStorageUrl(StorageBucket.PrizeImages, storagePath);
  const { data, error: insertError } = await supabase
    .from("media_files")
    .insert({
      tenant_id: tenantId,
      bucket_name: StorageBucket.PrizeImages,
      file_name: fileName,
      original_name: file.name,
      mime_type: validation.mimeType,
      file_size: file.size,
      storage_path: storagePath,
      public_url: publicUrl,
      width: metadata.width,
      height: metadata.height,
      uploaded_by: uploadedBy,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(StorageBucket.PrizeImages).remove([storagePath]);

    return {
      ok: false,
      error: "A imagem foi enviada, mas os metadados do premio nao foram registrados.",
    };
  }

  return {
    ok: true,
    mediaFile: data,
  };
}
