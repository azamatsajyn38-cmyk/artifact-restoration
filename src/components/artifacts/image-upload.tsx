"use client";

import { useState, useCallback } from "react";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onUpload: (dataUrl: string) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  return (
    <div
      className={`
        flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center
        transition-colors cursor-pointer
        ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-1">Загрузите фото артефакта</h3>
      <p className="text-sm text-muted-foreground">
        Перетащите изображение сюда или кликните для выбора
      </p>
    </div>
  );
}
