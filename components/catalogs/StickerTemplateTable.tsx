"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/Icon";
import {
  useCreateStickerTemplate,
  useDeleteStickerTemplate,
  useStickerTemplates,
  useUpdateStickerTemplate,
  type StickerTemplate,
} from "@/lib/api/hooks/stickers";

const ALL_FIELDS: StickerTemplate["visibleFields"] = ["name", "description", "serial", "asset_tag", "category", "barcode", "qr"];

export function StickerTemplateTable() {
  const { data: items = [] } = useStickerTemplates();
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dlg>
          <Button size="sm"><Icon icon={Plus} size={16} /> New</Button>
        </Dlg>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>DPI</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => <Row key={it.id} item={it} />)}
        </TableBody>
      </Table>
    </div>
  );
}

function Row({ item }: { item: StickerTemplate }) {
  const del = useDeleteStickerTemplate();
  return (
    <TableRow>
      <TableCell>{item.name} {item.isDefault ? <Badge variant="default" className="ml-2">Default</Badge> : null}</TableCell>
      <TableCell className="font-mono">{item.widthMm}×{item.heightMm}mm</TableCell>
      <TableCell className="font-mono">{item.dpi}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {item.visibleFields.map((f) => <Badge key={f} variant="outline">{f}</Badge>)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Dlg initial={item}>
          <Button variant="ghost" size="sm" aria-label="Edit"><Icon icon={Pencil} size={14} /></Button>
        </Dlg>
        <Button variant="ghost" size="sm" aria-label="Delete" onClick={() => confirm(`Delete ${item.name}?`) && del.mutate(item.id)}>
          <Icon icon={Trash2} size={14} className="text-brand-red" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function Dlg({ initial, children }: { initial?: StickerTemplate; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<StickerTemplate>>(initial ?? { widthMm: 50, heightMm: 25, dpi: 300, visibleFields: ["name", "serial", "qr"] });
  const create = useCreateStickerTemplate();
  const update = useUpdateStickerTemplate();

  function toggleField(f: StickerTemplate["visibleFields"][number]) {
    const cur = new Set(form.visibleFields ?? []);
    cur.has(f) ? cur.delete(f) : cur.add(f);
    setForm({ ...form, visibleFields: [...cur] as StickerTemplate["visibleFields"] });
  }

  function submit() {
    if (initial) update.mutate({ id: initial.id, body: form }, { onSuccess: () => setOpen(false) });
    else create.mutate(form, { onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Edit" : "Add"} sticker template</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Width (mm)</Label>
              <Input type="number" value={form.widthMm ?? 0} onChange={(e) => setForm({ ...form, widthMm: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>Height (mm)</Label>
              <Input type="number" value={form.heightMm ?? 0} onChange={(e) => setForm({ ...form, heightMm: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>DPI</Label>
              <Input type="number" value={form.dpi ?? 300} onChange={(e) => setForm({ ...form, dpi: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Visible fields</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_FIELDS.map((f) => (
                <label key={f} className="flex items-center gap-2 text-body-sm">
                  <Checkbox checked={(form.visibleFields ?? []).includes(f)} onCheckedChange={() => toggleField(f)} />
                  {f}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.isDefault ?? false} onCheckedChange={(c) => setForm({ ...form, isDefault: c === true })} />
            <Label>Default template</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
