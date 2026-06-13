import { UPLOAD_PURPOSE_CONFIG } from "@/config/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StorageBucket, UploadPurpose } from "@/types/media";

export function buildTenantStoragePath({
  tenantId,
  directory,
  fileName,
}: {
  tenantId: string;
  directory: string;
  fileName: string;
}) {
  return `tenants/${tenantId}/${directory}/${fileName}`;
}

export function getPurposeStoragePath({
  tenantId,
  purpose,
  fileName,
}: {
  tenantId: string;
  purpose: UploadPurpose;
  fileName: string;
}) {
  return buildTenantStoragePath({
    tenantId,
    directory: UPLOAD_PURPOSE_CONFIG[purpose].directory,
    fileName,
  });
}

export async function getPublicStorageUrl(bucket: StorageBucket, storagePath: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function createSignedStorageUrl({
  bucket,
  storagePath,
  expiresIn = 60 * 10,
}: {
  bucket: StorageBucket;
  storagePath: string;
  expiresIn?: number;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
