import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabasePublicEnv,
  isSupabaseConfigured,
} from "@/lib/env/public";
import type { Database } from "@/types/database";

function redirectTo(request: NextRequest, pathname: string, message?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  if (message) {
    url.searchParams.set(pathname === "/login" ? "error" : "reason", message);
  }

  return NextResponse.redirect(url);
}

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  message?: string,
) {
  const redirectResponse = redirectTo(request, pathname, message);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isParticipantRoute =
    pathname === "/minha-conta" ||
    pathname === "/meus-pedidos" ||
    pathname === "/meus-numeros" ||
    pathname.startsWith("/pedido/");

  if (!isAdminRoute && !isParticipantRoute) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return redirectTo(
      request,
      "/login",
      "Configure o Supabase para acessar esta area.",
    );
  }

  let response = NextResponse.next({ request });
  const { supabaseAnonKey, supabaseUrl } = getSupabasePublicEnv();
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return redirectWithCookies(
      request,
      response,
      "/login",
      isAdminRoute
        ? "Entre para acessar o admin."
        : "Entre para acessar sua conta.",
    );
  }

  // Authorization by role and tenant remains enforced by Server Components,
  // Server Actions and RLS. The proxy only refreshes and validates the session.
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/minha-conta",
    "/meus-pedidos",
    "/meus-numeros",
    "/pedido/:path*",
  ],
};
