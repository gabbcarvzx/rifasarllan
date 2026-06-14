import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Mail,
  MessageCircle,
  Play,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";

export async function Footer() {
  const settings = await getPublicPlatformSettings();
  const socials = [
    { href: settings.instagram_url, label: "Instagram", icon: Camera },
    { href: settings.facebook_url, label: "Facebook", icon: Users },
    { href: settings.youtube_url, label: "YouTube", icon: Play },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="border-t border-white/10 bg-black/22">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent/30 bg-accent/15 text-accent">
              {settings.logo_url ? (
                <Image
                  src={settings.logo_url}
                  alt={`Logo ${settings.platform_name}`}
                  fill
                  unoptimized
                  className="object-contain p-1"
                  sizes="40px"
                />
              ) : (
                <Ticket className="size-5" />
              )}
            </span>
            <p className="font-bold text-foreground">{settings.platform_name}</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            {settings.footer_text ?? settings.platform_subtitle}
          </p>
          {socials.length > 0 ? (
            <div className="mt-5 flex gap-2">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href!}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition hover:border-accent/30 hover:text-accent"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Navegacao</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <Link className="hover:text-foreground" href="/rifas">
              Rifas disponiveis
            </Link>
            <Link className="hover:text-foreground" href="/minha-conta">
              Minha conta
            </Link>
            <Link className="hover:text-foreground" href="/termos">
              Termos de uso
            </Link>
            <Link className="hover:text-foreground" href="/privacidade">
              Privacidade
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <ShieldCheck className="size-5 text-primary" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Suporte e confianca
          </p>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            {settings.support_email ? (
              <a
                href={`mailto:${settings.support_email}`}
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Mail className="size-4" />
                <span className="truncate">{settings.support_email}</span>
              </a>
            ) : null}
            {settings.whatsapp_number ? (
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <MessageCircle className="size-4" />
                {settings.whatsapp_number}
              </a>
            ) : null}
            {!settings.support_email && !settings.whatsapp_number ? (
              <p className="leading-6">Consulte os canais informados em sua reserva.</p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
