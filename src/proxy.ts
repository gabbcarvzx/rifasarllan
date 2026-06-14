import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Database, ProfileRole, TenantStatus } from "@/types/database";

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
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithCookies(
      request,
      response,
      "/login",
      isAdminRoute
        ? "Entre para acessar o admin."
        : "Entre para acessar sua conta.",
    );
  }

  if (!isAdminRoute) {
    return response;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role,tenant_id")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileData as {
    role: ProfileRole;
    tenant_id: string | null;
  } | null;

  if (profile?.role !== "admin" || !profile.tenant_id) {
    return redirectWithCookies(
      request,
      response,
      "/acesso-negado",
      "permissao-admin",
    );
  }

  const { data: tenantData } = await supabase
    .from("tenants")
    .select("status")
    .eq("id", profile.tenant_id)
    .maybeSingle();
  const tenant = tenantData as { status: TenantStatus } | null;

  if (tenant?.status !== "active") {
    return redirectWithCookies(
      request,
      response,
      "/acesso-negado",
      "tenant-inativo",
    );
  }

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
