"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export interface StickerTemplate {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
  visibleFields: Array<"name" | "description" | "serial" | "asset_tag" | "barcode" | "qr" | "category">;
  isDefault?: boolean;
}

export function useStickerTemplates() {
  return useQuery({
    queryKey: queryKeys.stickerTemplates(),
    queryFn: async () => {
      const res = await rawFetch("/sticker-templates");
      const json = (await res.json()) as { data?: StickerTemplate[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useCreateStickerTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<StickerTemplate>) => {
      const res = await rawFetch("/sticker-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as StickerTemplate;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stickerTemplates() }),
  });
}

export function useUpdateStickerTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<StickerTemplate> }) => {
      const res = await rawFetch(`/sticker-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as StickerTemplate;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stickerTemplates() }),
  });
}

export function useDeleteStickerTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await rawFetch(`/sticker-templates/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stickerTemplates() }),
  });
}

export async function downloadSticker(unitId: string, templateId?: string) {
  const path = `/assets/${unitId}/sticker.png${templateId ? `?template=${templateId}` : ""}`;
  const res = await rawFetch(path);
  const blob = await res.blob();
  const filename = `sticker-${unitId}.png`;
  const { default: FileSaver } = await import("file-saver");
  FileSaver.saveAs(blob, filename);
}

export async function downloadStickerBatch(unitIds: string[], templateId?: string) {
  const res = await rawFetch("/stickers/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unitIds, templateId }),
  });
  const blob = await res.blob();
  const { default: FileSaver } = await import("file-saver");
  FileSaver.saveAs(blob, `stickers-${new Date().toISOString().slice(0, 10)}.zip`);
}
