"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppShareUrl } from "@/lib/sharing/raffle";

export function ShareRaffleButton({ shareText }: { shareText: string }) {
  function shareOnWhatsApp() {
    const shareUrl = buildWhatsAppShareUrl(shareText, window.location.href);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={shareOnWhatsApp}
      className="w-full"
    >
      <MessageCircle className="size-4" />
      Compartilhar no WhatsApp
    </Button>
  );
}
