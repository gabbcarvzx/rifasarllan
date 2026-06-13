"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadRaffleImageFile } from "@/lib/storage/raffle-images";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Raffle, RaffleImage } from "@/types/database";

export type RaffleMediaActionState = {
  status: "idle" | "success" | "error";
  message: string;
  updatedAt?: number;
};

const MAX_GALLERY_IMAGES = 10;

function makeState(
  status: RaffleMediaActionState["status"],
  message: string,
): RaffleMediaActionState {
  return {
    status,
    message,
    updatedAt: Date.now(),
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size <= 0) {
    return null;
  }

  return value;
}

function getFormFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

async function getOwnedRaffle(raffleId: string, tenantId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("id", raffleId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function getRaffleMediaScope(raffleId: string) {
  const { user, profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false as const,
      error: "Seu perfil admin ainda nao esta vinculado a um tenant.",
    };
  }

  const raffle = await getOwnedRaffle(raffleId, profile.tenant_id);

  if (!raffle) {
    return {
      ok: false as const,
      error: "Rifa nao encontrada neste tenant.",
    };
  }

  return {
    ok: true as const,
    user,
    tenantId: profile.tenant_id,
    raffle,
  };
}

async function deactivateMediaByPublicUrl(publicUrl: string | null, tenantId: string) {
  if (!publicUrl) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("media_files")
    .update({ is_active: false })
    .eq("tenant_id", tenantId)
    .eq("bucket_name", "raffle-images")
    .eq("public_url", publicUrl);
}

async function deactivateMediaById(mediaFileId: string | null, tenantId: string) {
  if (!mediaFileId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("media_files")
    .update({ is_active: false })
    .eq("tenant_id", tenantId)
    .eq("bucket_name", "raffle-images")
    .eq("id", mediaFileId);
}

function revalidateRaffleMediaPaths(raffle: Raffle) {
  revalidatePath("/");
  revalidatePath("/rifas");
  revalidatePath("/admin/rifas");
  revalidatePath(`/admin/rifas/${raffle.id}/editar`);
  revalidatePath(`/rifas/${raffle.slug}`);
}

export async function uploadMainRaffleImage(
  _state: RaffleMediaActionState,
  formData: FormData,
): Promise<RaffleMediaActionState> {
  const raffleId = getFormString(formData, "raffleId");
  const file = getFormFile(formData, "mainImage");

  if (!raffleId) {
    return makeState("error", "Rifa nao informada.");
  }

  if (!file) {
    return makeState("error", "Selecione uma imagem principal.");
  }

  const scope = await getRaffleMediaScope(raffleId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const upload = await uploadRaffleImageFile({
    file,
    tenantId: scope.tenantId,
    raffleId: scope.raffle.id,
    uploadedBy: scope.user.id,
  });

  if (!upload.ok) {
    return makeState("error", upload.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("raffles")
    .update({ main_image_url: upload.mediaFile.public_url })
    .eq("id", scope.raffle.id)
    .eq("tenant_id", scope.tenantId);

  if (error) {
    await deactivateMediaById(upload.mediaFile.id, scope.tenantId);

    return makeState(
      "error",
      "Imagem enviada, mas nao foi possivel vincular como principal.",
    );
  }

  if (scope.raffle.main_image_url !== upload.mediaFile.public_url) {
    await deactivateMediaByPublicUrl(scope.raffle.main_image_url, scope.tenantId);
  }

  revalidateRaffleMediaPaths({
    ...scope.raffle,
    main_image_url: upload.mediaFile.public_url,
  });

  return makeState("success", "Imagem principal atualizada com sucesso.");
}

export async function removeMainRaffleImage(
  _state: RaffleMediaActionState,
  formData: FormData,
): Promise<RaffleMediaActionState> {
  const raffleId = getFormString(formData, "raffleId");

  if (!raffleId) {
    return makeState("error", "Rifa nao informada.");
  }

  const scope = await getRaffleMediaScope(raffleId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("raffles")
    .update({ main_image_url: null })
    .eq("id", scope.raffle.id)
    .eq("tenant_id", scope.tenantId);

  if (error) {
    return makeState("error", "Nao foi possivel remover a imagem principal.");
  }

  await deactivateMediaByPublicUrl(scope.raffle.main_image_url, scope.tenantId);
  revalidateRaffleMediaPaths({ ...scope.raffle, main_image_url: null });

  return makeState("success", "Imagem principal removida.");
}

export async function uploadGalleryImages(
  _state: RaffleMediaActionState,
  formData: FormData,
): Promise<RaffleMediaActionState> {
  const raffleId = getFormString(formData, "raffleId");
  const files = getFormFiles(formData, "galleryImages");

  if (!raffleId) {
    return makeState("error", "Rifa nao informada.");
  }

  if (files.length === 0) {
    return makeState("error", "Selecione pelo menos uma imagem para a galeria.");
  }

  const scope = await getRaffleMediaScope(raffleId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data: currentImages, error: currentError } = await supabase
    .from("raffle_images")
    .select("*")
    .eq("raffle_id", scope.raffle.id)
    .order("order_index", { ascending: true });

  if (currentError) {
    return makeState("error", "Nao foi possivel validar a galeria atual.");
  }

  if ((currentImages?.length ?? 0) + files.length > MAX_GALLERY_IMAGES) {
    return makeState(
      "error",
      `A galeria permite no maximo ${MAX_GALLERY_IMAGES} imagens.`,
    );
  }

  let nextOrderIndex =
    currentImages?.reduce(
      (highest, image) => Math.max(highest, image.order_index),
      -1,
    ) ?? -1;
  let uploadedCount = 0;

  for (const file of files) {
    const upload = await uploadRaffleImageFile({
      file,
      tenantId: scope.tenantId,
      raffleId: scope.raffle.id,
      uploadedBy: scope.user.id,
    });

    if (!upload.ok) {
      revalidateRaffleMediaPaths(scope.raffle);

      return makeState(
        "error",
        uploadedCount > 0
          ? `${uploadedCount} imagem(ns) enviada(s), mas uma imagem falhou: ${upload.error}`
          : upload.error,
      );
    }

    nextOrderIndex += 1;

    const { error: insertError } = await supabase.from("raffle_images").insert({
      raffle_id: scope.raffle.id,
      media_file_id: upload.mediaFile.id,
      image_url: upload.mediaFile.public_url ?? "",
      alt_text: scope.raffle.title,
      order_index: nextOrderIndex,
    });

    if (insertError) {
      await deactivateMediaById(upload.mediaFile.id, scope.tenantId);
      revalidateRaffleMediaPaths(scope.raffle);

      return makeState(
        "error",
        "A imagem foi enviada, mas nao foi possivel incluir na galeria.",
      );
    }

    uploadedCount += 1;
  }

  revalidateRaffleMediaPaths(scope.raffle);

  return makeState(
    "success",
    `${uploadedCount} imagem(ns) adicionada(s) a galeria.`,
  );
}

export async function removeGalleryImage(
  _state: RaffleMediaActionState,
  formData: FormData,
): Promise<RaffleMediaActionState> {
  const imageId = getFormString(formData, "imageId");

  if (!imageId) {
    return makeState("error", "Imagem da galeria nao informada.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: galleryImage, error: imageError } = await supabase
    .from("raffle_images")
    .select("*")
    .eq("id", imageId)
    .maybeSingle();

  if (imageError || !galleryImage) {
    return makeState("error", "Imagem da galeria nao encontrada.");
  }

  const scope = await getRaffleMediaScope(galleryImage.raffle_id);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const { error: deleteError } = await supabase
    .from("raffle_images")
    .delete()
    .eq("id", galleryImage.id)
    .eq("raffle_id", scope.raffle.id);

  if (deleteError) {
    return makeState("error", "Nao foi possivel remover a imagem da galeria.");
  }

  await deactivateMediaById(galleryImage.media_file_id, scope.tenantId);

  if (!galleryImage.media_file_id) {
    await deactivateMediaByPublicUrl(galleryImage.image_url, scope.tenantId);
  }

  revalidateRaffleMediaPaths(scope.raffle);

  return makeState("success", "Imagem removida da galeria.");
}

export async function reorderGalleryImages(
  _state: RaffleMediaActionState,
  formData: FormData,
): Promise<RaffleMediaActionState> {
  const raffleId = getFormString(formData, "raffleId");
  const orderedIds = getFormString(formData, "orderedIds")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!raffleId || orderedIds.length === 0) {
    return makeState("error", "Ordem da galeria nao informada.");
  }

  const scope = await getRaffleMediaScope(raffleId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data: galleryImages, error } = await supabase
    .from("raffle_images")
    .select("id")
    .eq("raffle_id", scope.raffle.id);

  if (error) {
    return makeState("error", "Nao foi possivel carregar a galeria.");
  }

  const validIds = new Set((galleryImages ?? []).map((image) => image.id));

  if (orderedIds.some((id) => !validIds.has(id))) {
    return makeState("error", "A ordem contem imagens que nao pertencem a rifa.");
  }

  for (const [index, imageId] of orderedIds.entries()) {
    const { error: updateError } = await supabase
      .from("raffle_images")
      .update({ order_index: index })
      .eq("id", imageId)
      .eq("raffle_id", scope.raffle.id);

    if (updateError) {
      return makeState("error", "Nao foi possivel salvar a nova ordem.");
    }
  }

  revalidateRaffleMediaPaths(scope.raffle);

  return makeState("success", "Ordem da galeria atualizada.");
}

export async function getAdminRaffleImages(raffleId: string) {
  const scope = await getRaffleMediaScope(raffleId);

  if (!scope.ok) {
    return {
      data: [] as RaffleImage[],
      error: scope.error,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffle_images")
    .select("*")
    .eq("raffle_id", scope.raffle.id)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      data: [] as RaffleImage[],
      error: "Nao foi possivel carregar a galeria.",
    };
  }

  return {
    data: data ?? [],
  };
}

export async function getPublicRaffleImages(raffleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffle_images")
    .select("*")
    .eq("raffle_id", raffleId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return [] as RaffleImage[];
  }

  return data ?? [];
}
