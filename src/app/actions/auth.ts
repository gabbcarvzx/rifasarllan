"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env/public";
import { getServerProfile, getServerUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(path: string, type: "error" | "success", message: string) {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
}

export async function getCurrentUser() {
  return getServerUser();
}

export async function getCurrentProfile() {
  return getServerProfile();
}

export async function signInWithEmail(formData: FormData) {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");

  if (!email || !password) {
    redirectWithMessage("/login", "error", "Informe e-mail e senha.");
  }

  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/login",
      "error",
      "Supabase ainda nao esta configurado neste ambiente.",
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithMessage("/login", "error", "E-mail ou senha invalidos.");
  }

  const profile = data.user ? await getServerProfile(data.user.id) : null;

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirectWithMessage("/minha-conta", "success", "Login realizado com sucesso.");
}

export async function signUpWithEmail(formData: FormData) {
  const fullName = getFormString(formData, "fullName");
  const phone = getFormString(formData, "phone");
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  const confirmPassword = getFormString(formData, "confirmPassword");

  if (!fullName || !phone || !email || !password || !confirmPassword) {
    redirectWithMessage("/cadastro", "error", "Preencha todos os campos.");
  }

  if (password.length < 8) {
    redirectWithMessage(
      "/cadastro",
      "error",
      "A senha precisa ter pelo menos 8 caracteres.",
    );
  }

  if (password !== confirmPassword) {
    redirectWithMessage("/cadastro", "error", "As senhas nao coincidem.");
  }

  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/cadastro",
      "error",
      "Supabase ainda nao esta configurado neste ambiente.",
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        whatsapp: phone,
      },
    },
  });

  if (error) {
    redirectWithMessage(
      "/cadastro",
      "error",
      "Nao foi possivel criar sua conta. Revise os dados ou tente outro e-mail.",
    );
  }

  if (data.session) {
    redirectWithMessage(
      "/minha-conta",
      "success",
      "Cadastro criado com sucesso.",
    );
  }

  redirectWithMessage(
    "/login",
    "success",
    "Cadastro criado. Verifique seu e-mail, se a confirmacao estiver ativa.",
  );
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirectWithMessage("/login", "success", "Voce saiu da sua conta.");
}
