import Link from "next/link";
import { ShieldCheck, Ticket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/22">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
              <Ticket className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-accent">
                RIFA
              </p>
              <p className="font-bold text-foreground">Arllan</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Plataforma preparada para operar rifas online com visual premium,
            gestão administrativa e evolução segura para pagamentos e sorteios.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Navegação</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <Link className="hover:text-foreground" href="/rifas">
              Rifas disponíveis
            </Link>
            <Link className="hover:text-foreground" href="/login">
              Login
            </Link>
            <Link className="hover:text-foreground" href="/admin">
              Painel admin
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <ShieldCheck className="size-5 text-primary" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Arquitetura SaaS-first
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            A base já considera separação por tenant, Supabase, storage e
            evolução futura para billing recorrente.
          </p>
        </div>
      </div>
    </footer>
  );
}
