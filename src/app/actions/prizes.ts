"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadPrizeImageFile } from "@/lib/storage/prize-images";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Raffle, RafflePrize } from "@/types/database";

export type PrizeActionState = {
  status: "idle" | "success" | "error";
  message: string;
  updatedAt?: number;
};

export type PublicPrizeSummary = {
  count: number;
  primaryTitle: string | null;
};

type PrizeScope =
  | {
      ok: true;
      userId: string;
      tenantId: string;
      raffle: Raffle;
    }
  | {
      ok: false;
      error: string;
    };

type OwnedPrizeScope =
  | {
      ok: true;
      userId: string;
      tenantId: string;
      raffle: Raffle;
      prize: RafflePrize;
    }
  | {
      ok: false;
      error: string;
    };

function makeState(
  status: PrizeActionState["status"],
  message: string,
): PrizeActionState {
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

function parsePositiveInt(value: string, fieldLabel: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      ok: false as const,
      error: `${fieldLabel} deve ser maior que zero.`,
    };
  }

  return {
    ok: true as const,
    value: parsed,
  };
}

function validatePrizePayload(formData: FormData) {
  const title = getFormString(formData, "title");
  const description = getFormString(formData, "description");
  const quantityResult = parsePositiveInt(
    getFormString(formData, "quantity") || "1",
    "A quantidade",
  );
  const rawPosition = getFormString(formData, "position");
  const positionResult = rawPosition
    ? parsePositiveInt(rawPosition, "A posicao")
    : { ok: true as const, value: null };

  if (!title) {
    return {
      ok: false as const,
      error: "Informe o titulo do premio.",
    };
  }

  if (!quantityResult.ok) {
    return quantityResult;
  }

  if (!positionResult.ok) {
    return positionResult;
  }

  return {
    ok: true as const,
    payload: {
      title,
      description: description || null,
      quantity: quantityResult.value,
      position: positionResult.value,
    },
  };
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

async function getPrizeScope(raffleId: string): Promise<PrizeScope> {
  const { user, profile } = await requireAdmin();

  if (!profile.tenant_id) {
    return {
      ok: false,
      error: "Seu perfil admin ainda nao esta vinculado a um tenant.",
    };
  }

  const raffle = await getOwnedRaffle(raffleId, profile.tenant_id);

  if (!raffle) {
    return {
      ok: false,
      error: "Rifa nao encontrada neste tenant.",
    };
  }

  return {
    ok: true,
    userId: user.id,
    tenantId: profile.tenant_id,
    raffle,
  };
}

async function getOwnedPrizeScope(prizeId: string): Promise<OwnedPrizeScope> {
  if (!prizeId) {
    return {
      ok: false,
      error: "Premio nao informado.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: prize, error: prizeError } = await supabase
    .from("raffle_prizes")
    .select("*")
    .eq("id", prizeId)
    .maybeSingle();

  if (prizeError || !prize) {
    return {
      ok: false,
      error: "Premio nao encontrado.",
    };
  }

  const scope = await getPrizeScope(prize.raffle_id);

  if (!scope.ok) {
    return scope;
  }

  return {
    ...scope,
    prize,
  };
}

async function getNextPrizePosition(raffleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffle_prizes")
    .select("position")
    .eq("raffle_id", raffleId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return 1;
  }

  return (data?.position ?? 0) + 1;
}

async function deactivatePrizeMediaById(mediaFileId: string | null, tenantId: string) {
  if (!mediaFileId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("media_files")
    .update({ is_active: false })
    .eq("tenant_id", tenantId)
    .eq("bucket_name", "prize-images")
    .eq("id", mediaFileId);
}

async function deactivatePrizeMediaByPublicUrl(
  publicUrl: string | null,
  tenantId: string,
) {
  if (!publicUrl) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("media_files")
    .update({ is_active: false })
    .eq("tenant_id", tenantId)
    .eq("bucket_name", "prize-images")
    .eq("public_url", publicUrl);
}

function revalidatePrizePaths(raffle: Raffle) {
  updateTag(CACHE_TAGS.publicRaffles);
  revalidatePath("/");
  revalidatePath("/rifas");
  revalidatePath("/admin");
  revalidatePath("/admin/rifas");
  revalidatePath(`/admin/rifas/${raffle.id}/editar`);
  revalidatePath(`/rifas/${raffle.slug}`);
}

async function replacePrizeImage({
  file,
  scope,
  prize,
}: {
  file: File;
  scope: PrizeScope & { ok: true };
  prize: RafflePrize;
}) {
  const supabase = await createSupabaseServerClient();
  const upload = await uploadPrizeImageFile({
    file,
    tenantId: scope.tenantId,
    raffleId: scope.raffle.id,
    prizeId: prize.id,
    uploadedBy: scope.userId,
  });

  if (!upload.ok) {
    return upload;
  }

  const { error } = await supabase
    .from("raffle_prizes")
    .update({
      image_url: upload.mediaFile.public_url,
      media_file_id: upload.mediaFile.id,
    })
    .eq("id", prize.id)
    .eq("raffle_id", scope.raffle.id);

  if (error) {
    await deactivatePrizeMediaById(upload.mediaFile.id, scope.tenantId);

    return {
      ok: false as const,
      error: "Imagem enviada, mas nao foi possivel vincular ao premio.",
    };
  }

  await deactivatePrizeMediaById(prize.media_file_id, scope.tenantId);

  if (!prize.media_file_id) {
    await deactivatePrizeMediaByPublicUrl(prize.image_url, scope.tenantId);
  }

  return upload;
}

export async function createPrize(
  _state: PrizeActionState,
  formData: FormData,
): Promise<PrizeActionState> {
  const raffleId = getFormString(formData, "raffleId");

  if (!raffleId) {
    return makeState("error", "Rifa nao informada.");
  }

  const scope = await getPrizeScope(raffleId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const validation = validatePrizePayload(formData);

  if (!validation.ok) {
    return makeState("error", validation.error);
  }

  const supabase = await createSupabaseServerClient();
  const position =
    validation.payload.position ?? (await getNextPrizePosition(scope.raffle.id));
  const { data: prize, error } = await supabase
    .from("raffle_prizes")
    .insert({
      raffle_id: scope.raffle.id,
      title: validation.payload.title,
      description: validation.payload.description,
      quantity: validation.payload.quantity,
      position,
    })
    .select("*")
    .single();

  if (error) {
    return makeState(
      "error",
      "Nao foi possivel criar o premio. Revise os dados e tente novamente.",
    );
  }

  const image = getFormFile(formData, "prizeImage");

  if (image) {
    const upload = await replacePrizeImage({
      file: image,
      scope,
      prize,
    });

    if (!upload.ok) {
      revalidatePrizePaths(scope.raffle);

      return makeState(
        "error",
        `Premio criado, mas a imagem falhou: ${upload.error}`,
      );
    }
  }

  revalidatePrizePaths(scope.raffle);

  return makeState("success", "Premio criado com sucesso.");
}

export async function updatePrize(
  _state: PrizeActionState,
  formData: FormData,
): Promise<PrizeActionState> {
  const prizeId = getFormString(formData, "prizeId");
  const scope = await getOwnedPrizeScope(prizeId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const validation = validatePrizePayload(formData);

  if (!validation.ok) {
    return makeState("error", validation.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("raffle_prizes")
    .update({
      title: validation.payload.title,
      description: validation.payload.description,
      quantity: validation.payload.quantity,
      position: validation.payload.position ?? scope.prize.position,
    })
    .eq("id", scope.prize.id)
    .eq("raffle_id", scope.raffle.id);

  if (error) {
    return makeState("error", "Nao foi possivel atualizar o premio.");
  }

  const image = getFormFile(formData, "prizeImage");

  if (image) {
    const upload = await replacePrizeImage({
      file: image,
      scope,
      prize: scope.prize,
    });

    if (!upload.ok) {
      revalidatePrizePaths(scope.raffle);

      return makeState(
        "error",
        `Premio atualizado, mas a imagem falhou: ${upload.error}`,
      );
    }
  }

  revalidatePrizePaths(scope.raffle);

  return makeState("success", "Premio atualizado com sucesso.");
}

export async function deletePrize(
  _state: PrizeActionState,
  formData: FormData,
): Promise<PrizeActionState> {
  const prizeId = getFormString(formData, "prizeId");
  const scope = await getOwnedPrizeScope(prizeId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("raffle_prizes")
    .delete()
    .eq("id", scope.prize.id)
    .eq("raffle_id", scope.raffle.id);

  if (error) {
    return makeState("error", "Nao foi possivel excluir o premio.");
  }

  await deactivatePrizeMediaById(scope.prize.media_file_id, scope.tenantId);

  if (!scope.prize.media_file_id) {
    await deactivatePrizeMediaByPublicUrl(scope.prize.image_url, scope.tenantId);
  }

  revalidatePrizePaths(scope.raffle);

  return makeState("success", "Premio excluido com sucesso.");
}

export async function reorderPrizes(
  _state: PrizeActionState,
  formData: FormData,
): Promise<PrizeActionState> {
  const raffleId = getFormString(formData, "raffleId");
  const orderedIds = getFormString(formData, "orderedIds")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!raffleId || orderedIds.length === 0) {
    return makeState("error", "Ordem dos premios nao informada.");
  }

  const scope = await getPrizeScope(raffleId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data: prizes, error } = await supabase
    .from("raffle_prizes")
    .select("id")
    .eq("raffle_id", scope.raffle.id);

  if (error) {
    return makeState("error", "Nao foi possivel carregar os premios.");
  }

  const validIds = new Set((prizes ?? []).map((prize) => prize.id));

  if (orderedIds.some((id) => !validIds.has(id))) {
    return makeState("error", "A ordem contem premios que nao pertencem a rifa.");
  }

  for (const [index, prizeId] of orderedIds.entries()) {
    const { error: updateError } = await supabase
      .from("raffle_prizes")
      .update({ position: index + 1 })
      .eq("id", prizeId)
      .eq("raffle_id", scope.raffle.id);

    if (updateError) {
      return makeState("error", "Nao foi possivel salvar a nova ordem.");
    }
  }

  revalidatePrizePaths(scope.raffle);

  return makeState("success", "Ordem dos premios atualizada.");
}

export async function uploadPrizeImage(
  _state: PrizeActionState,
  formData: FormData,
): Promise<PrizeActionState> {
  const prizeId = getFormString(formData, "prizeId");
  const image = getFormFile(formData, "prizeImage");
  const scope = await getOwnedPrizeScope(prizeId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  if (!image) {
    return makeState("error", "Selecione uma imagem do premio.");
  }

  const upload = await replacePrizeImage({
    file: image,
    scope,
    prize: scope.prize,
  });

  if (!upload.ok) {
    return makeState("error", upload.error);
  }

  revalidatePrizePaths(scope.raffle);

  return makeState("success", "Imagem do premio atualizada.");
}

export async function removePrizeImage(
  _state: PrizeActionState,
  formData: FormData,
): Promise<PrizeActionState> {
  const prizeId = getFormString(formData, "prizeId");
  const scope = await getOwnedPrizeScope(prizeId);

  if (!scope.ok) {
    return makeState("error", scope.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("raffle_prizes")
    .update({
      image_url: null,
      media_file_id: null,
    })
    .eq("id", scope.prize.id)
    .eq("raffle_id", scope.raffle.id);

  if (error) {
    return makeState("error", "Nao foi possivel remover a imagem do premio.");
  }

  await deactivatePrizeMediaById(scope.prize.media_file_id, scope.tenantId);

  if (!scope.prize.media_file_id) {
    await deactivatePrizeMediaByPublicUrl(scope.prize.image_url, scope.tenantId);
  }

  revalidatePrizePaths(scope.raffle);

  return makeState("success", "Imagem do premio removida.");
}

export async function getRafflePrizes(raffleId: string) {
  const scope = await getPrizeScope(raffleId);

  if (!scope.ok) {
    return {
      data: [] as RafflePrize[],
      error: scope.error,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffle_prizes")
    .select("*")
    .eq("raffle_id", scope.raffle.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      data: [] as RafflePrize[],
      error: "Nao foi possivel carregar os premios da rifa.",
    };
  }

  return {
    data: data ?? [],
  };
}

export async function getPublicRafflePrizes(raffleId: string) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("raffle_prizes")
    .select("*")
    .eq("raffle_id", raffleId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return [] as RafflePrize[];
  }

  return data ?? [];
}

export async function getPublicPrizeSummaries(raffleIds: string[]) {
  if (raffleIds.length === 0) {
    return {} as Record<string, PublicPrizeSummary>;
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("raffle_prizes")
    .select("raffle_id,title,position")
    .in("raffle_id", raffleIds)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {} as Record<string, PublicPrizeSummary>;
  }

  return (data ?? []).reduce<Record<string, PublicPrizeSummary>>((acc, prize) => {
    const current = acc[prize.raffle_id] ?? {
      count: 0,
      primaryTitle: null,
    };

    acc[prize.raffle_id] = {
      count: current.count + 1,
      primaryTitle: current.primaryTitle ?? prize.title,
    };

    return acc;
  }, {});
}
