"use client";

import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileUp } from "lucide-react";
import { Icon } from "@/components/shared/Icon";

interface Props {
  onFile: (f: File) => void;
}

export function ImportDropzone({ onFile }: Props) {
  const t = useTranslations();
  const [picked, setPicked] = useState<File | null>(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    onDrop: (accepted) => {
      const file = accepted[0];
      if (file) {
        setPicked(file);
        onFile(file);
      }
    },
  });
  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer items-center justify-center gap-3 rounded-DEFAULT border border-dashed bg-surface px-6 py-12 text-body-sm transition-colors ${
        isDragActive ? "border-brand-blue bg-brand-blue-50" : "border-line-strong text-ink-3"
      }`}
    >
      <input {...getInputProps()} />
      <Icon icon={FileUp} size={24} />
      <div>
        <p className="text-ink">{picked ? picked.name : t("asset.import.selectFile")}</p>
        <p className="font-mono text-caption text-ink-3">CSV or XLSX</p>
      </div>
    </div>
  );
}
