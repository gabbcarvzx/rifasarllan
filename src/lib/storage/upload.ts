import { randomUUID } from "node:crypto";
import { UPLOAD_PURPOSE_CONFIG, STORAGE_BUCKETS } from "@/config/storage";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getImageMetadata } from "@/lib/storage/image-processing";
import { extensionFromMimeType, validateStorageFile } from "@/lib/storage/validation";
import { getPurposeStoragePath, getPublicStorageUrl } from "@/lib/storage/urls";
import { normalizeSlug } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MediaBucketName } from "@/types/database";
import type { AllowedImageMimeType, UploadPurpose, UploadResult } from "@/types/media";

function getBaseFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const normalized = normalizeSlug(withoutExtension);

  return normalized || "arquivo";
}

function buildStoredFileName(originalName: string, mimeType: AllowedImageMimeType) {
  const extension = extensionFromMimeType(mimeType);
  return `${getBaseFileName(originalName)}-${randomUUID()}.${extension}`;
}

export async function uploadMediaFile(
  file: File,
  purpose: UploadPurpose,
): Promise<UploadResult> {
  const { user, profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false,
      error: "O admin precisa estar vinculado a um tenant para enviar arquivos.",
    };
  }

  const validation = await validateStorageFile(file, purpose);

  if (!validation.ok) {
    return validation;
  }

  const purposeConfig = UPLOAD_PURPOSE_CONFIG[purpose];
  const bucketConfig = STORAGE_BUCKETS[purposeConfig.bucket];
  const fileName = buildStoredFileName(file.name, validation.mimeType);
  const storagePath = getPurposeStoragePath({
    tenantId: profile.tenant_id,
    purpose,
    fileName,
  });
  const metadata = await getImageMetadata(file);
  const supabase = await createSupabaseServerClient();

  const { error: uploadError } = await supabase.storage
    .from(purposeConfig.bucket)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      error: "Nao foi possivel enviar o arquivo para o Storage.",
    };
  }

  const publicUrl = bucketConfig.isPublic
    ? await getPublicStorageUrl(purposeConfig.bucket, storagePath)
    : null;

  const { data, error: insertError } = await supabase
    .from("media_files")
    .insert({
      tenant_id: profile.tenant_id,
      bucket_name: purposeConfig.bucket as MediaBucketName,
      file_name: fileName,
      original_name: file.name,
      mime_type: validation.mimeType,
      file_size: file.size,
      storage_path: storagePath,
      public_url: publicUrl,
      width: metadata.width,
      height: metadata.height,
      uploaded_by: user.id,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(purposeConfig.bucket).remove([storagePath]);

    return {
      ok: false,
      error: "O arquivo foi enviado, mas nao foi possivel registrar os metadados.",
    };
  }

  return {
    ok: true,
    mediaFile: data,
  };
}
