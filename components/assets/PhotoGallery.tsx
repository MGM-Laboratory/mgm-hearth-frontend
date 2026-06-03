"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/api/uploads";

export interface GalleryItem {
  id?: string;
  url: string;
  fileId?: string;
}

interface Props {
  value: GalleryItem[];
  onChange: (next: GalleryItem[]) => void;
  /** File kind for the multipart upload. */
  kind?: "asset_photo" | "handover_photo";
  maxFiles?: number;
}

export function PhotoGallery({ value, onChange, kind = "asset_photo", maxFiles = 16 }: Props) {
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: maxFiles - value.length,
    onDrop: async (accepted) => {
      setUploading(true);
      try {
        const uploaded = await Promise.all(accepted.map((f) => uploadFile(f, kind)));
        onChange([
          ...value,
          ...uploaded.map((u) => ({ id: u.id, url: u.url, fileId: u.id })),
        ]);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-DEFAULT border border-dashed bg-surface px-4 py-8 text-body-sm transition-colors ${
          isDragActive ? "border-brand-blue bg-brand-blue-50" : "border-line-strong text-ink-3"
        }`}
      >
        <input {...getInputProps()} />
        <Icon icon={ImageIcon} size={20} />
        <span>{uploading ? "Uploading…" : isDragActive ? "Drop to upload" : "Drag images or click to upload"}</span>
      </div>
      {value.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {value.map((g, i) => (
            <li key={g.id ?? i} className="group relative aspect-square overflow-hidden rounded-DEFAULT border border-line">
              <img src={g.url} alt="" className="h-full w-full object-cover" />
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <Icon icon={Trash2} size={14} />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
