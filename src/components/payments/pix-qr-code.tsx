import Image from "next/image";
import { QrCode } from "lucide-react";

export function PixQRCode({ value }: { value?: string | null }) {
  if (!value) {
    return (
      <div className="flex aspect-square w-full max-w-64 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
        <QrCode className="size-8 text-muted" />
        <p className="mt-3 text-sm font-semibold text-foreground">
          QR Code ainda nao gerado
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-64 rounded-lg border border-white/10 bg-white p-3 shadow-premium">
      <Image
        src={value}
        alt="QR Code Pix para pagamento"
        width={256}
        height={256}
        unoptimized
        className="aspect-square h-auto w-full"
      />
    </div>
  );
}
