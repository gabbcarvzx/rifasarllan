import { Building2, CheckCircle2, Smartphone } from "lucide-react";

const steps = [
  {
    title: "Abra o aplicativo do banco",
    description: "Escolha a opcao Pix e depois pagar com QR Code ou copia e cola.",
    icon: Smartphone,
  },
  {
    title: "Confira o recebedor e o valor",
    description: "Valide os dados exibidos pelo banco antes de confirmar.",
    icon: Building2,
  },
  {
    title: "Atualize o status",
    description: "Depois do pagamento, use o botao de atualizar para consultar o Asaas.",
    icon: CheckCircle2,
  },
];

export function CheckoutInstructions() {
  return (
    <div className="grid gap-3">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <div
            key={step.title}
            className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
