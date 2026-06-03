"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/Icon";
import { uploadFile } from "@/lib/api/uploads";
import { useLicenseCatalog, useUpsertLicenseCatalogItem, useDeleteLicenseCatalogItem, type LicenseCatalogItem } from "@/lib/api/hooks/catalogs";

export function SoftwareCatalogTable() {
  const { data: items = [] } = useLicenseCatalog();
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
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Seats</TableHead>
            <TableHead>CLI</TableHead>
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

function Row({ item }: { item: LicenseCatalogItem }) {
  const del = useDeleteLicenseCatalogItem();
  return (
    <TableRow>
      <TableCell>{item.logoUrl ? <img src={item.logoUrl} alt="" className="h-8 w-8 rounded-sm object-contain" /> : <div className="h-8 w-8 rounded-sm bg-surface-muted" />}</TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell><Badge variant="outline">{item.kind}</Badge></TableCell>
      <TableCell className="font-mono">{item.seatLimit ?? "—"}</TableCell>
      <TableCell>{item.hasCodeVersion ? <Badge variant="default">CLI</Badge> : <span className="text-ink-3">—</span>}</TableCell>
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

function Dlg({ initial, children }: { initial?: LicenseCatalogItem; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<LicenseCatalogItem>>(initial ?? { kind: "software" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const upsert = useUpsertLicenseCatalogItem();

  async function pickLogo(file: File) {
    setUploadingLogo(true);
    try {
      const u = await uploadFile(file, "software_logo");
      setForm((f) => ({ ...f, logoFileId: u.id, logoUrl: u.url }));
    } finally {
      setUploadingLogo(false);
    }
  }

  function submit() {
    upsert.mutate({ ...form, id: initial?.id }, { onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Edit" : "Add"} software/AI catalog item</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-sm border border-line bg-surface-muted">
                {form.logoUrl ? <img src={form.logoUrl} alt="" className="h-full w-full object-contain" /> : null}
              </div>
              <Input
                type="file"
                accept="image/png,image/svg+xml,image/jpeg"
                onChange={(e) => e.target.files?.[0] && pickLogo(e.target.files[0])}
                disabled={uploadingLogo}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Kind</Label>
              <Select value={form.kind ?? "software"} onValueChange={(v) => setForm({ ...form, kind: v as "software" | "ai" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Seat limit</Label>
              <Input type="number" value={form.seatLimit ?? ""} onChange={(e) => setForm({ ...form, seatLimit: Number(e.target.value) || undefined })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.hasCodeVersion ?? false} onCheckedChange={(c) => setForm({ ...form, hasCodeVersion: c === true })} />
            <Label>Has code/CLI version</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={upsert.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
