"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env/public";
import { getServerProfile, getServerUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SignUpActionState } from "@/types/auth";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string,
): never {
  const separator = path.includes("?") ? "&" : "?";
  return redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
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

function signUpError(message: string): SignUpActionState {
  return { status: "error", message, updatedAt: Date.now() };
}

function getSignUpErrorMessage(code?: string) {
  if (code === "user_already_exists") {
    return "Ja existe uma conta para este e-mail. Tente entrar ou recuperar seu acesso.";
  }

  if (code === "weak_password") {
    return "A senha foi considerada fraca. Use pelo menos 8 caracteres e combine letras e numeros.";
  }

  if (code === "email_address_invalid") {
    return "O e-mail informado nao e valido.";
  }

  if (code === "email_not_confirmed") {
    return "Este e-mail ainda precisa ser confirmado.";
  }

  if (code === "signup_disabled" || code === "email_provider_disabled") {
    return "Novos cadastros estao temporariamente indisponiveis.";
  }

  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") {
    return "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.";
  }

  if (code === "database_error") {
    return "A conta nao foi finalizada porque o perfil nao pode ser criado. Tente novamente ou contate o suporte.";
  }

  return "Nao foi possivel criar sua conta agora. Revise os dados e tente novamente.";
}

export async function signUpWithEmail(
  _state: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const fullName = getFormString(formData, "fullName");
  const phone = getFormString(formData, "phone");
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  const confirmPassword = getFormString(formData, "confirmPassword");

  if (!fullName || !phone || !email || !password || !confirmPassword) {
    return signUpError("Preencha todos os campos.");
  }

  if (password.length < 8) {
    return signUpError("A senha precisa ter pelo menos 8 caracteres.");
  }

  if (password !== confirmPassword) {
    return signUpError("As senhas nao coincidem.");
  }

  if (!isSupabaseConfigured()) {
    return signUpError("O cadastro ainda nao esta disponivel neste ambiente.");
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
    console.error("auth.signup.failed", {
      code: error.code ?? "unknown",
      status: error.status ?? null,
    });
    return signUpError(getSignUpErrorMessage(error.code));
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
