"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { isHexColor } from "@/lib/platform-settings/theme";
import { cn } from "@/lib/utils";

type ColorPickerFieldProps = {
  name: string;
  label: string;
  description: string;
  defaultValue: string;
};

export function ColorPickerField({
  name,
  label,
  description,
  defaultValue,
}: ColorPickerFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const previewColor = isHexColor(value) ? value : defaultValue;

  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <div className="flex gap-2">
        <input
          type="color"
          value={previewColor}
          aria-label={`Selecionar ${label.toLowerCase()}`}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-black/20 p-1"
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 rounded border border-white/20"
            style={{ backgroundColor: previewColor }}
          />
          <Input
            name={name}
            value={value}
            maxLength={7}
            className={cn(
              "pl-10 font-mono uppercase",
              value && !isHexColor(value) && "border-danger/60",
            )}
            onChange={(event) => setValue(event.target.value)}
            required
          />
        </div>
      </div>
      <span className="text-xs font-normal leading-5 text-muted">
        {description}
      </span>
    </label>
  );
}
