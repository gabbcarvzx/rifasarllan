"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
};

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  className,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 p-3 backdrop-blur sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-[var(--radius-lg)] border border-border/85 bg-card text-card-foreground shadow-premium",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/80 p-5 sm:p-6">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Fechar modal"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
