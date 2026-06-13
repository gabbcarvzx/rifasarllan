"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PixCopyPaste({ value }: { value?: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Pix copia e cola
        <textarea
          value={value ?? ""}
          readOnly
          rows={4}
          className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 font-mono text-xs leading-5 text-foreground outline-none"
          placeholder="O codigo Pix aparecera aqui."
        />
      </label>
      <Button
        type="button"
        variant="secondary"
        disabled={!value}
        onClick={copyValue}
        className="w-full"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Codigo copiado" : "Copiar codigo Pix"}
      </Button>
    </div>
  );
}
