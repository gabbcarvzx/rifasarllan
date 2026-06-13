"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { normalizeSlug } from "@/lib/slug";
import { uploadRaffleImageFile } from "@/lib/storage/raffle-images";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Raffle, RaffleStatus } from "@/types/database";

type RaffleMutationPayload = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  rules: string;
  price_per_number: number;
  total_numbers: number;
  min_number: number;
  max_number: number;
  draw_date: string;
  status: RaffleStatus;
  featured: boolean;
};

type AdminRafflesResult = {
  data: Raffle[];
  error?: string;
};

type AdminRaffleResult = {
  data: Raffle | null;
  error?: string;
};

const createStatuses = new Set<RaffleStatus>(["draft", "active"]);
const allStatuses = new Set<RaffleStatus>([
  "draft",
  "active",
  "paused",
  "finished",
  "cancelled",
]);

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
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

function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string,
): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
}

function parsePositiveInt(value: string, fieldLabel: string, errorPath: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    redirectWithMessage(errorPath, "error", `${fieldLabel} deve ser maior que zero.`);
  }

  return parsed;
}

function parseMoney(value: string, errorPath: string) {
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    redirectWithMessage(
      errorPath,
      "error",
      "O valor por numero deve ser maior que zero.",
    );
  }

  return Math.round(parsed * 100) / 100;
}

function parseDrawDate(value: string, errorPath: string) {
  if (!value) {
    redirectWithMessage(errorPath, "error", "Informe a data do sorteio.");
  }

  const date = new Date(`${value}T12:00:00.000-03:00`);

  if (Number.isNaN(date.getTime())) {
    redirectWithMessage(errorPath, "error", "A data do sorteio e invalida.");
  }

  return date.toISOString();
}

function validateStatus(
  value: string,
  allowedStatuses: Set<RaffleStatus>,
  errorPath: string,
) {
  if (!allStatuses.has(value as RaffleStatus)) {
    redirectWithMessage(errorPath, "error", "Status de rifa invalido.");
  }

  const status = value as RaffleStatus;

  if (!allowedStatuses.has(status)) {
    redirectWithMessage(
      errorPath,
      "error",
      "Este status nao esta liberado para esta acao.",
    );
  }

  return status;
}

function validateRaffleForm(
  formData: FormData,
  errorPath: string,
  allowedStatuses: Set<RaffleStatus>,
): RaffleMutationPayload {
  const title = getFormString(formData, "title");
  const providedSlug = getFormString(formData, "slug");
  const slug = normalizeSlug(providedSlug || title);
  const shortDescription = getFormString(formData, "shortDescription");
  const description = getFormString(formData, "description");
  const rules = getFormString(formData, "rules");
  const pricePerNumber = parseMoney(
    getFormString(formData, "pricePerNumber"),
    errorPath,
  );
  const totalNumbers = parsePositiveInt(
    getFormString(formData, "totalNumbers"),
    "A quantidade total de numeros",
    errorPath,
  );
  const minNumber = parsePositiveInt(
    getFormString(formData, "minNumber") || "1",
    "O numero inicial",
    errorPath,
  );
  const rawMaxNumber = getFormString(formData, "maxNumber");
  const maxNumber = rawMaxNumber
    ? parsePositiveInt(rawMaxNumber, "O numero final", errorPath)
    : minNumber + totalNumbers - 1;
  const drawDate = parseDrawDate(getFormString(formData, "drawDate"), errorPath);
  const status = validateStatus(
    getFormString(formData, "status") || "draft",
    allowedStatuses,
    errorPath,
  );

  if (!title) {
    redirectWithMessage(errorPath, "error", "Informe o titulo da rifa.");
  }

  if (!slug) {
    redirectWithMessage(errorPath, "error", "Informe um slug valido.");
  }

  if (!shortDescription) {
    redirectWithMessage(errorPath, "error", "Informe a descricao curta.");
  }

  if (!description) {
    redirectWithMessage(errorPath, "error", "Informe a descricao completa.");
  }

  if (!rules) {
    redirectWithMessage(errorPath, "error", "Informe as regras da rifa.");
  }

  if (minNumber > maxNumber) {
    redirectWithMessage(
      errorPath,
      "error",
      "O numero inicial precisa ser menor ou igual ao numero final.",
    );
  }

  const rangeSize = maxNumber - minNumber + 1;

  if (rangeSize !== totalNumbers) {
    redirectWithMessage(
      errorPath,
      "error",
      "A faixa de numeros precisa bater com a quantidade total informada.",
    );
  }

  return {
    title,
    slug,
    short_description: shortDescription,
    description,
    rules,
    price_per_number: pricePerNumber,
    total_numbers: totalNumbers,
    min_number: minNumber,
    max_number: maxNumber,
    draw_date: drawDate,
    status,
    featured: getFormBoolean(formData, "featured"),
  };
}

async function getAdminScope() {
  const { user, profile } = await requireAdmin();

  if (!profile.tenant_id) {
    redirectWithMessage(
      "/acesso-negado",
      "error",
      "Seu perfil admin ainda nao esta vinculado a um tenant.",
    );
  }

  return { user, profile, tenantId: profile.tenant_id };
}

function getDatabaseMessage(errorMessage?: string) {
  if (!errorMessage) {
    return "Nao foi possivel concluir a operacao.";
  }

  if (
    errorMessage.includes("raffles_tenant_slug_unique") ||
    errorMessage.toLowerCase().includes("duplicate key")
  ) {
    return "Ja existe uma rifa com este slug neste tenant.";
  }

  return "Nao foi possivel concluir a operacao. Revise os dados e tente novamente.";
}

function revalidateRafflePaths(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/rifas");
  revalidatePath("/admin");
  revalidatePath("/admin/rifas");

  if (slug) {
    revalidatePath(`/rifas/${slug}`);
  }
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

async function ensureNumbersForRaffle(
  raffleId: string,
  errorPath: string,
  successPathFallback: string,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.schema("public").rpc("generate_raffle_numbers", {
    p_raffle_id: raffleId,
  });

  if (error) {
    redirectWithMessage(
      successPathFallback || errorPath,
      "error",
      "A rifa foi salva, mas os numeros nao foram gerados. Verifique se o admin pertence ao tenant correto.",
    );
  }
}

async function assertRangeCanChange(
  raffle: Raffle,
  payload: RaffleMutationPayload,
  errorPath: string,
) {
  const rangeChanged =
    raffle.min_number !== payload.min_number ||
    raffle.max_number !== payload.max_number ||
    raffle.total_numbers !== payload.total_numbers;

  if (!rangeChanged) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { count, error: countError } = await supabase
    .from("raffle_numbers")
    .select("id", { count: "exact", head: true })
    .eq("raffle_id", raffle.id)
    .neq("status", "available");

  if (countError) {
    redirectWithMessage(
      errorPath,
      "error",
      "Nao foi possivel validar os numeros existentes desta rifa.",
    );
  }

  if ((count ?? 0) > 0) {
    redirectWithMessage(
      errorPath,
      "error",
      "A faixa de numeros nao pode ser alterada quando ja existem numeros reservados, pagos ou cancelados.",
    );
  }
}

async function syncNumbersAfterRangeUpdate(
  raffle: Raffle,
  payload: RaffleMutationPayload,
  errorPath: string,
) {
  const rangeChanged =
    raffle.min_number !== payload.min_number ||
    raffle.max_number !== payload.max_number ||
    raffle.total_numbers !== payload.total_numbers;

  if (!rangeChanged) {
    return;
  }

  const supabase = await createSupabaseServerClient();

  const { error: deleteError } = await supabase
    .from("raffle_numbers")
    .delete()
    .eq("raffle_id", raffle.id)
    .eq("status", "available")
    .or(`number.lt.${payload.min_number},number.gt.${payload.max_number}`);

  if (deleteError) {
    redirectWithMessage(
      errorPath,
      "error",
      "A rifa foi atualizada, mas nao foi possivel remover numeros fora da nova faixa.",
    );
  }

  await ensureNumbersForRaffle(raffle.id, errorPath, errorPath);
}

async function uploadInitialRaffleMedia({
  formData,
  raffle,
  tenantId,
  userId,
}: {
  formData: FormData;
  raffle: Raffle;
  tenantId: string;
  userId: string;
}) {
  const mainImage = getFormFile(formData, "mainImage");
  const galleryImages = getFormFiles(formData, "galleryImages");
  const supabase = await createSupabaseServerClient();

  if (galleryImages.length > 10) {
    redirectWithMessage(
      `/admin/rifas/${raffle.id}/editar`,
      "error",
      "A rifa foi criada, mas a galeria permite no maximo 10 imagens.",
    );
  }

  if (mainImage) {
    const upload = await uploadRaffleImageFile({
      file: mainImage,
      tenantId,
      raffleId: raffle.id,
      uploadedBy: userId,
    });

    if (!upload.ok) {
      redirectWithMessage(
        `/admin/rifas/${raffle.id}/editar`,
        "error",
        `A rifa foi criada, mas a imagem principal falhou: ${upload.error}`,
      );
    }

    const { error } = await supabase
      .from("raffles")
      .update({ main_image_url: upload.mediaFile.public_url })
      .eq("id", raffle.id)
      .eq("tenant_id", tenantId);

    if (error) {
      redirectWithMessage(
        `/admin/rifas/${raffle.id}/editar`,
        "error",
        "A imagem principal foi enviada, mas nao foi vinculada a rifa.",
      );
    }

    raffle.main_image_url = upload.mediaFile.public_url;
  }

  let orderIndex = 0;

  for (const file of galleryImages) {
    const upload = await uploadRaffleImageFile({
      file,
      tenantId,
      raffleId: raffle.id,
      uploadedBy: userId,
    });

    if (!upload.ok) {
      redirectWithMessage(
        `/admin/rifas/${raffle.id}/editar`,
        "error",
        `A rifa foi criada, mas uma imagem da galeria falhou: ${upload.error}`,
      );
    }

    const { error } = await supabase.from("raffle_images").insert({
      raffle_id: raffle.id,
      media_file_id: upload.mediaFile.id,
      image_url: upload.mediaFile.public_url ?? "",
      alt_text: raffle.title,
      order_index: orderIndex,
    });

    if (error) {
      redirectWithMessage(
        `/admin/rifas/${raffle.id}/editar`,
        "error",
        "Uma imagem foi enviada, mas nao foi incluida na galeria.",
      );
    }

    orderIndex += 1;
  }
}

export async function createRaffle(formData: FormData) {
  const { user, tenantId } = await getAdminScope();
  const payload = validateRaffleForm(
    formData,
    "/admin/rifas/nova",
    createStatuses,
  );
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("raffles")
    .insert({
      ...payload,
      tenant_id: tenantId,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    redirectWithMessage(
      "/admin/rifas/nova",
      "error",
      getDatabaseMessage(error.message),
    );
  }

  await ensureNumbersForRaffle(
    data.id,
    "/admin/rifas/nova",
    `/admin/rifas/${data.id}/editar`,
  );

  await uploadInitialRaffleMedia({
    formData,
    raffle: data,
    tenantId,
    userId: user.id,
  });

  revalidateRafflePaths(data.slug);
  redirectWithMessage(
    `/admin/rifas/${data.id}/editar`,
    "success",
    "Rifa criada com sucesso. Numeros e imagens foram processados.",
  );
}

export async function updateRaffle(formData: FormData) {
  const { tenantId } = await getAdminScope();
  const raffleId = getFormString(formData, "raffleId");

  if (!raffleId) {
    redirectWithMessage("/admin/rifas", "error", "Rifa nao encontrada.");
  }

  const errorPath = `/admin/rifas/${raffleId}/editar`;
  const currentRaffle = await getOwnedRaffle(raffleId, tenantId);

  if (!currentRaffle) {
    redirectWithMessage(
      "/admin/rifas",
      "error",
      "Rifa nao encontrada neste tenant.",
    );
  }

  const payload = validateRaffleForm(formData, errorPath, allStatuses);
  await assertRangeCanChange(currentRaffle, payload, errorPath);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .update(payload)
    .eq("id", raffleId)
    .eq("tenant_id", tenantId)
    .select("*")
    .single();

  if (error) {
    redirectWithMessage(errorPath, "error", getDatabaseMessage(error.message));
  }

  await syncNumbersAfterRangeUpdate(currentRaffle, payload, errorPath);
  revalidateRafflePaths(currentRaffle.slug);
  revalidateRafflePaths(data.slug);
  redirectWithMessage(errorPath, "success", "Rifa atualizada com sucesso.");
}

export async function changeRaffleStatus(
  raffleId: string,
  status: RaffleStatus,
) {
  if (!allStatuses.has(status)) {
    redirectWithMessage("/admin/rifas", "error", "Status invalido.");
  }

  const { tenantId } = await getAdminScope();
  const currentRaffle = await getOwnedRaffle(raffleId, tenantId);

  if (!currentRaffle) {
    redirectWithMessage(
      "/admin/rifas",
      "error",
      "Rifa nao encontrada neste tenant.",
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .update({ status })
    .eq("id", raffleId)
    .eq("tenant_id", tenantId)
    .select("*")
    .single();

  if (error) {
    redirectWithMessage("/admin/rifas", "error", getDatabaseMessage(error.message));
  }

  revalidateRafflePaths(currentRaffle.slug);
  revalidateRafflePaths(data.slug);
  redirectWithMessage("/admin/rifas", "success", "Status da rifa atualizado.");
}

export async function deleteRaffle(raffleId: string) {
  const { tenantId } = await getAdminScope();
  const currentRaffle = await getOwnedRaffle(raffleId, tenantId);

  if (!currentRaffle) {
    redirectWithMessage(
      "/admin/rifas",
      "error",
      "Rifa nao encontrada neste tenant.",
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .update({ status: "cancelled" })
    .eq("id", raffleId)
    .eq("tenant_id", tenantId)
    .select("*")
    .single();

  if (error) {
    redirectWithMessage("/admin/rifas", "error", getDatabaseMessage(error.message));
  }

  revalidateRafflePaths(currentRaffle.slug);
  revalidateRafflePaths(data.slug);
  redirectWithMessage(
    "/admin/rifas",
    "success",
    "Rifa cancelada logicamente. Os dados foram preservados para auditoria.",
  );
}

export async function getAdminRaffles(): Promise<AdminRafflesResult> {
  const { tenantId } = await getAdminScope();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: [],
      error: "Nao foi possivel carregar as rifas deste tenant.",
    };
  }

  return { data: data ?? [] };
}

export async function getAdminRaffleById(
  id: string,
): Promise<AdminRaffleResult> {
  const { tenantId } = await getAdminScope();
  const raffle = await getOwnedRaffle(id, tenantId);

  if (!raffle) {
    return {
      data: null,
      error: "Rifa nao encontrada neste tenant.",
    };
  }

  return { data: raffle };
}
