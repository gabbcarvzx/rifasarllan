import { randomUUID } from "node:crypto";
import { StorageBucket } from "@/types/media";
import { getImageMetadata } from "@/lib/storage/image-processing";
import {
  extensionFromMimeType,
  getFileExtension,
  validateStorageFile,
} from "@/lib/storage/validation";
import { getPublicStorageUrl } from "@/lib/storage/urls";
import { normalizeSlug } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AllowedImageMimeType, UploadResult } from "@/types/media";

function getBaseFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return normalizeSlug(withoutExtension) || "imagem";
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

export function buildRaffleImageStoragePath({
  tenantId,
  raffleId,
  fileName,
}: {
  tenantId: string;
  raffleId: string;
  fileName: string;
}) {
  return `${tenantId}/${raffleId}/${fileName}`;
}

export async function uploadRaffleImageFile({
  file,
  tenantId,
  raffleId,
  uploadedBy,
}: {
  file: File;
  tenantId: string;
  raffleId: string;
  uploadedBy: string;
}): Promise<UploadResult> {
  const validation = await validateStorageFile(file, "raffle-image");

  if (!validation.ok) {
    return validation;
  }

  const fileName = buildStoredFileName(file.name, validation.mimeType);
  const storagePath = buildRaffleImageStoragePath({
    tenantId,
    raffleId,
    fileName,
  });
  const metadata = await getImageMetadata(file);
  const supabase = await createSupabaseServerClient();

  const { error: uploadError } = await supabase.storage
    .from(StorageBucket.RaffleImages)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      error: "Nao foi possivel enviar a imagem para o Storage.",
    };
  }

  const publicUrl = await getPublicStorageUrl(StorageBucket.RaffleImages, storagePath);
  const { data, error: insertError } = await supabase
    .from("media_files")
    .insert({
      tenant_id: tenantId,
      bucket_name: StorageBucket.RaffleImages,
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
    await supabase.storage.from(StorageBucket.RaffleImages).remove([storagePath]);

    return {
      ok: false,
      error: "A imagem foi enviada, mas os metadados nao foram registrados.",
    };
  }

  return {
    ok: true,
    mediaFile: data,
  };
}
