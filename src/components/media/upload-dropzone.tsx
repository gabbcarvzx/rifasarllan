"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/config/storage";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  name?: string;
  label?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
};

function filesFromList(fileList: FileList | null) {
  return fileList ? Array.from(fileList) : [];
}

export function UploadDropzone({
  name,
  label = "Selecionar arquivo",
  description = "JPG, PNG ou WEBP com validacao server-side.",
  accept = ALLOWED_IMAGE_MIME_TYPES.join(","),
  multiple = false,
  disabled = false,
  onFilesSelected,
  className,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: File[]) {
    if (files.length === 0 || disabled) {
      return;
    }

    const selectedFiles = multiple ? files : files.slice(0, 1);

    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      selectedFiles.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files;
    }

    onFilesSelected?.(selectedFiles);
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-5 transition",
        isDragging && "border-primary/55 bg-primary/10",
        disabled && "pointer-events-none opacity-55",
        className,
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(filesFromList(event.dataTransfer.files));
      }}
    >
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => handleFiles(filesFromList(event.target.files))}
      />
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
          <UploadCloud className="size-5" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">{label}</h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-muted">{description}</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Procurar arquivo
        </Button>
      </div>
    </div>
  );
}
