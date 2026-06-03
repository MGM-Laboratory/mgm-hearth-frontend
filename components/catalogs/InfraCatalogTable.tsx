"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/shared/Icon";
import { Badge } from "@/components/ui/badge";
import { useDeleteInfraCatalogItem, useInfraCatalog, useUpsertInfraCatalogItem, type InfraCatalogItem } from "@/lib/api/hooks/catalogs";

const CATEGORIES = ["compute", "storage", "database", "messaging", "search", "observability", "networking", "secrets", "cicd", "other"] as const;

export function InfraCatalogTable() {
  const { data: items = [] } = useInfraCatalog();
  const t = useTranslations();
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ItemDialog>
          <Button size="sm"><Icon icon={Plus} size={16} /> {t("common.create")}</Button>
        </ItemDialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => (
            <Row key={it.id} item={it} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Row({ item }: { item: InfraCatalogItem }) {
  const del = useDeleteInfraCatalogItem();
  return (
    <TableRow>
      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.active ? <Badge variant="green">Active</Badge> : <Badge variant="outline">Inactive</Badge>}</TableCell>
      <TableCell className="text-right">
        <ItemDialog initial={item}>
          <Button variant="ghost" size="sm" aria-label="Edit"><Icon icon={Pencil} size={14} /></Button>
        </ItemDialog>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete"
          onClick={() => confirm(`Delete ${item.name}?`) && del.mutate(item.id)}
        >
          <Icon icon={Trash2} size={14} className="text-brand-red" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ItemDialog({ initial, children }: { initial?: InfraCatalogItem; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<InfraCatalogItem>>(initial ?? { category: "compute", active: true });
  const upsert = useUpsertInfraCatalogItem();
  function submit() {
    upsert.mutate({ ...form, id: initial?.id }, { onSuccess: () => setOpen(false) });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit" : "Add"} infra item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={form.category ?? "compute"} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.active ?? true} onCheckedChange={(c) => setForm({ ...form, active: c === true })} />
            <Label>Active</Label>
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
