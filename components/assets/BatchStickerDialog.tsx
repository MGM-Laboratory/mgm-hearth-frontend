"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStickerTemplates, downloadSticker, downloadStickerBatch } from "@/lib/api/hooks/stickers";
import type { AssetUnit } from "@/lib/api/hooks/assets";
import { ApiError } from "@/lib/api/errors";

interface Props {
  units: AssetUnit[];
  children: React.ReactNode;
}

export function BatchStickerDialog({ units, children }: Props) {
  const [open, setOpen] = useState(false);
  const { data: templates = [] } = useStickerTemplates();
  const defaultTpl = templates.find((t) => t.isDefault) ?? templates[0];
  const [templateId, setTemplateId] = useState<string | undefined>(defaultTpl?.id);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function selectAll() {
    setSelected(new Set(units.map((u) => u.id)));
  }

  async function go() {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      if (selected.size === 1) {
        await downloadSticker([...selected][0], templateId);
      } else {
        await downloadStickerBatch([...selected], templateId);
      }
      toast.success("Sticker(s) downloaded");
      setOpen(false);
    } catch (e) {
      const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
      toast.error(i18n);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate stickers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-caption text-ink-2">Template</label>
            <Select value={templateId ?? ""} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue placeholder="Pick a template" /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name} · {t.widthMm}×{t.heightMm}mm</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-caption text-ink-3">{selected.size}/{units.length} selected</p>
            <Button variant="ghost" size="sm" onClick={selectAll}>Select all</Button>
          </div>
          <ul className="max-h-72 overflow-auto rounded-DEFAULT border border-line">
            {units.map((u) => (
              <li key={u.id} className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0">
                <Checkbox checked={selected.has(u.id)} onCheckedChange={() => toggle(u.id)} />
                <span className="font-mono text-caption text-ink">{u.serialNumber ?? u.publicId}</span>
                <span className="ml-auto font-mono text-caption text-ink-3">{u.assetTag ?? "—"}</span>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={go} disabled={busy || selected.size === 0 || !templateId}>
            {selected.size <= 1 ? "Download PNG" : "Download ZIP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
