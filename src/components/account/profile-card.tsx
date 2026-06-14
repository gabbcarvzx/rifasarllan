import { CalendarDays, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { MyProfile } from "@/types/account";

export function ProfileCard({ profile }: { profile: MyProfile }) {
  const details = [
    { label: "E-mail", value: profile.email ?? "Nao informado", icon: Mail },
    {
      label: "WhatsApp",
      value: profile.phone ?? "Nao informado",
      icon: Smartphone,
    },
    {
      label: "Conta criada em",
      value: formatDate(profile.created_at),
      icon: CalendarDays,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Perfil
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground">
            {profile.full_name ?? "Participante"}
          </h2>
        </div>
        <Badge variant={profile.role === "admin" ? "default" : "info"}>
          <ShieldCheck className="mr-1 size-3" />
          {profile.role === "admin" ? "Admin" : "Participante"}
        </Badge>
      </div>

      <div className="grid divide-y divide-white/10">
        {details.map((detail) => {
          const Icon = detail.icon;

          return (
            <div key={detail.label} className="flex items-center gap-3 px-5 py-4">
              <Icon className="size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  {detail.label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {detail.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
