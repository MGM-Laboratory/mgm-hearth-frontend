"use client";

import { useMemo } from "react";
import type { StickerTemplate } from "@/lib/api/hooks/stickers";
import type { AssetUnit } from "@/lib/api/hooks/assets";

interface Props {
  unit: AssetUnit;
  modelName?: string;
  modelDescription?: string;
  categoryName?: string;
  template: StickerTemplate;
}

const MM_TO_PX = 3.78; // ~96dpi preview

export function StickerPreview({ unit, modelName, modelDescription, categoryName, template }: Props) {
  const w = Math.round(template.widthMm * MM_TO_PX);
  const h = Math.round(template.heightMm * MM_TO_PX);
  const publicUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_PUBLIC_ASSET_BASE_URL ?? "https://hearth.labmgm.org/a";
    return `${base}/${unit.publicId}`;
  }, [unit.publicId]);

  const show = (k: StickerTemplate["visibleFields"][number]) => template.visibleFields.includes(k);

  return (
    <div
      role="img"
      aria-label={`Sticker preview for ${modelName ?? unit.publicId}`}
      style={{ width: w, height: h }}
      className="relative overflow-hidden rounded-sm border-2 border-ink bg-white p-2 text-ink"
    >
      <div className="flex h-full gap-2">
        <div className="flex flex-1 flex-col">
          {show("name") ? (
            <p className="font-display text-[13px] font-semibold leading-tight">{modelName ?? "—"}</p>
          ) : null}
          {show("description") && modelDescription ? (
            <p className="mt-0.5 text-[10px] leading-tight text-ink-2 line-clamp-2">{modelDescription}</p>
          ) : null}
          {show("category") && categoryName ? (
            <p className="mt-auto font-mono text-[9px] uppercase tracking-wider text-ink-3">{categoryName}</p>
          ) : null}
          {show("serial") ? (
            <p className="font-mono text-[10px] text-ink-2">SN {unit.serialNumber ?? "—"}</p>
          ) : null}
          {show("asset_tag") && unit.assetTag ? (
            <p className="font-mono text-[10px] text-ink-2">TAG {unit.assetTag}</p>
          ) : null}
          {show("barcode") ? (
            <div className="mt-1 h-3 w-full bg-[repeating-linear-gradient(90deg,#000_0_2px,transparent_2px_4px)]" aria-hidden />
          ) : null}
        </div>
        {show("qr") ? (
          <div className="flex shrink-0 flex-col items-center">
            <div className="grid h-12 w-12 grid-cols-5 grid-rows-5 gap-px bg-white p-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className={i % 3 === 0 || i % 7 === 0 ? "bg-ink" : "bg-white"} />
              ))}
            </div>
            <p className="mt-0.5 max-w-[48px] truncate font-mono text-[8px] text-ink-3">{publicUrl.replace(/^https?:\/\//, "")}</p>
          </div>
        ) : null}
      </div>
      <span className="absolute right-1 top-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-blue" aria-hidden />
    </div>
  );
}
