import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MediaFile } from "@/types/media";

type DeleteMediaFileOptions = {
  physical?: boolean;
};

async function getOwnedMediaFile(mediaFileId: string, tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_files")
    .select("*")
    .eq("id", mediaFileId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export async function deactivateMediaFile(mediaFileId: string) {
  const { profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false as const,
      error: "O admin precisa estar vinculado a um tenant.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_files")
    .update({ is_active: false })
    .eq("id", mediaFileId)
    .eq("tenant_id", profile.tenant_id)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false as const,
      error: "Nao foi possivel desativar o arquivo.",
    };
  }

  return {
    ok: true as const,
    mediaFile: data as MediaFile,
  };
}

export async function deleteMediaFile(
  mediaFileId: string,
  options: DeleteMediaFileOptions = {},
) {
  const { profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false as const,
      error: "O admin precisa estar vinculado a um tenant.",
    };
  }

  const mediaFile = await getOwnedMediaFile(mediaFileId, profile.tenant_id);

  if (!mediaFile) {
    return {
      ok: false as const,
      error: "Arquivo nao encontrado neste tenant.",
    };
  }

  if (options.physical) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.storage
      .from(mediaFile.bucket_name)
      .remove([mediaFile.storage_path]);

    if (error) {
      return {
        ok: false as const,
        error: "Nao foi possivel remover o arquivo do Storage.",
      };
    }
  }

  return deactivateMediaFile(mediaFileId);
}
