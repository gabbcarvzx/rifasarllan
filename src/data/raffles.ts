import {
  BarChart3,
  CalendarCheck2,
  CircleDollarSign,
  TicketCheck,
} from "lucide-react";
import type { AdminStat, Raffle, RaffleNumberPreview } from "@/types/raffle";

export const demoTenantId = "tenant_demo_rifa_arllan";

export const featuredRaffles: Raffle[] = [
  {
    id: "raffle_001",
    tenantId: demoTenantId,
    slug: "iphone-15-pro-max",
    title: "iPhone 15 Pro Max",
    subtitle: "256GB, lacrado, com nota fiscal e garantia.",
    prize: "iPhone 15 Pro Max 256GB",
    ticketPrice: 12.9,
    totalNumbers: 10000,
    soldNumbers: 6420,
    reservedNumbers: 390,
    status: "active",
    drawDate: "2026-07-18",
    image: "/images/hero-raffle-premium.png",
    highlight: "Rifa destaque",
  },
  {
    id: "raffle_002",
    tenantId: demoTenantId,
    slug: "kit-premium-casa-inteligente",
    title: "Kit Casa Inteligente",
    subtitle: "Automação residencial com assistente, luzes e fechadura smart.",
    prize: "Kit completo smart home",
    ticketPrice: 6.5,
    totalNumbers: 5000,
    soldNumbers: 2120,
    reservedNumbers: 180,
    status: "active",
    drawDate: "2026-08-02",
    image: "/images/hero-raffle-premium.png",
    highlight: "Mais procurada",
  },
  {
    id: "raffle_003",
    tenantId: demoTenantId,
    slug: "vale-compras-10k",
    title: "Vale-compras R$ 10.000",
    subtitle: "Credito para realizar sua compra dos sonhos.",
    prize: "Vale-compras de R$ 10.000",
    ticketPrice: 9.9,
    totalNumbers: 8000,
    soldNumbers: 7560,
    reservedNumbers: 210,
    status: "active",
    drawDate: "2026-07-05",
    image: "/images/hero-raffle-premium.png",
    highlight: "Últimas cotas",
  },
];

export const raffleNumbersPreview: RaffleNumberPreview[] = Array.from(
  { length: 80 },
  (_, index) => {
    const number = index + 1;

    if ([4, 9, 16, 22, 31, 47, 58, 69].includes(number)) {
      return { number, status: "paid" };
    }

    if ([7, 18, 29, 36, 52, 63, 74].includes(number)) {
      return { number, status: "reserved" };
    }

    return { number, status: "available" };
  },
);

export const adminStats: AdminStat[] = [
  {
    label: "Receita prevista",
    value: "R$ 84.720",
    helper: "Placeholder até a Etapa 12",
    trend: "+18,4%",
    icon: CircleDollarSign,
  },
  {
    label: "Números vendidos",
    value: "16.100",
    helper: "Soma demonstrativa",
    trend: "+9,1%",
    icon: TicketCheck,
  },
  {
    label: "Rifas ativas",
    value: "3",
    helper: "Publicadas no portal",
    trend: "100%",
    icon: CalendarCheck2,
  },
  {
    label: "Conversão estimada",
    value: "7,8%",
    helper: "Métrica visual inicial",
    trend: "+2,3%",
    icon: BarChart3,
  },
];
