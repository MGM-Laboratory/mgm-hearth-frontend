"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Pencil, Plus } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Icon } from "@/components/shared/Icon";
import { useCreateUnit, useDeleteUnit, useUpdateUnit, type AssetUnit } from "@/lib/api/hooks/assets";

export function UnitTable({ modelId, units }: { modelId: string; units: AssetUnit[] }) {
  const t = useTranslations();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">
          {units.length} {t("asset.unit")}
        </p>
        <UnitDialog modelId={modelId}>
          <Button size="sm" variant="default">
            <Icon icon={Plus} size={16} /> {t("asset.actions.addUnit")}
          </Button>
        </UnitDialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("asset.serial")}</TableHead>
            <TableHead>{t("asset.assetTag")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>{t("asset.location.room")}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((u) => (
            <UnitRow key={u.id} unit={u} />
          ))}
          {units.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-ink-3">
                {t("common.empty")}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

function UnitRow({ unit }: { unit: AssetUnit }) {
  const t = useTranslations();
  const del = useDeleteUnit();
  return (
    <TableRow>
      <TableCell className="font-mono text-caption">{unit.serialNumber ?? "—"}</TableCell>
      <TableCell className="font-mono text-caption">{unit.assetTag ?? "—"}</TableCell>
      <TableCell><StatusBadge domain="asset" status={unit.status} /></TableCell>
      <TableCell>{t(`asset.condition.${unit.condition}` as never)}</TableCell>
      <TableCell>{unit.location?.room ?? "—"}</TableCell>
      <TableCell className="text-right">
        <UnitDialog modelId={unit.modelId} initial={unit}>
          <Button variant="ghost" size="sm" aria-label="Edit">
            <Icon icon={Pencil} size={14} />
          </Button>
        </UnitDialog>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete"
          onClick={() => {
            if (confirm(`Delete unit ${unit.serialNumber ?? unit.publicId}?`)) del.mutate(unit.id);
          }}
        >
          <Icon icon={Trash2} size={14} className="text-brand-red" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function UnitDialog({
  modelId,
  initial,
  children,
}: {
  modelId: string;
  initial?: AssetUnit;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<AssetUnit>>(initial ?? {});
  const create = useCreateUnit(modelId);
  const update = useUpdateUnit();
  const t = useTranslations();

  function submit() {
    if (initial?.id) {
      update.mutate(
        { unitId: initial.id, body: form },
        { onSuccess: () => setOpen(false) },
      );
    } else {
      create.mutate(form, { onSuccess: () => setOpen(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? t("common.edit") : t("asset.actions.addUnit")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="serial">{t("asset.serial")}</Label>
            <Input id="serial" value={form.serialNumber ?? ""} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tag">{t("asset.assetTag")}</Label>
            <Input id="tag" value={form.assetTag ?? ""} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status ?? "available"} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["available", "reserved", "borrowed", "in_maintenance", "retired", "lost"].map((s) => (
                  <SelectItem key={s} value={s}>{t(`asset.status.${s}` as never)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="condition">Condition</Label>
            <Select value={form.condition ?? "good"} onValueChange={(v) => setForm({ ...form, condition: v })}>
              <SelectTrigger id="condition"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["excellent", "good", "fair", "broken"].map((c) => (
                  <SelectItem key={c} value={c}>{t(`asset.condition.${c}` as never)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="room">{t("asset.location.room")}</Label>
            <Input id="room" value={form.location?.room ?? ""} onChange={(e) => setForm({ ...form, location: { ...form.location, room: e.target.value } })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="shelf">{t("asset.location.shelf")}</Label>
            <Input id="shelf" value={form.location?.shelf ?? ""} onChange={(e) => setForm({ ...form, location: { ...form.location, shelf: e.target.value } })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="price">{t("asset.purchase.price")}</Label>
            <Input id="price" type="number" value={form.purchase?.price ?? ""} onChange={(e) => setForm({ ...form, purchase: { ...form.purchase, price: Number(e.target.value) || undefined } })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="purchaseDate">{t("asset.purchase.date")}</Label>
            <Input id="purchaseDate" type="date" value={form.purchase?.date ?? ""} onChange={(e) => setForm({ ...form, purchase: { ...form.purchase, date: e.target.value || undefined } })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="useful">{t("asset.purchase.usefulLifeMonths")}</Label>
            <Input id="useful" type="number" value={form.purchase?.usefulLifeMonths ?? ""} onChange={(e) => setForm({ ...form, purchase: { ...form.purchase, usefulLifeMonths: Number(e.target.value) || undefined } })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="salvage">{t("asset.purchase.salvageValue")}</Label>
            <Input id="salvage" type="number" value={form.purchase?.salvageValue ?? ""} onChange={(e) => setForm({ ...form, purchase: { ...form.purchase, salvageValue: Number(e.target.value) || undefined } })} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor="method">{t("asset.purchase.depreciationMethod")}</Label>
            <Select
              value={form.purchase?.depreciationMethod ?? "straight_line"}
              onValueChange={(v) => setForm({ ...form, purchase: { ...form.purchase, depreciationMethod: v as AssetUnit["purchase"]["depreciationMethod"] } })}
            >
              <SelectTrigger id="method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="straight_line">{t("asset.depreciationMethod.straight_line")}</SelectItem>
                <SelectItem value="declining_balance">{t("asset.depreciationMethod.declining_balance")}</SelectItem>
                <SelectItem value="none">{t("asset.depreciationMethod.none")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
