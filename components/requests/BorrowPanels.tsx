"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PhotoGallery, type GalleryItem } from "@/components/assets/PhotoGallery";
import { useGenericLifecycle } from "@/lib/api/hooks/requests";
import { ApiError } from "@/lib/api/errors";

interface BorrowItem {
  modelId: string;
  modelName: string;
  quantity: number;
  allocatedUnitIds?: string[];
  candidateUnits?: Array<{ id: string; serialNumber?: string; assetTag?: string }>;
}

interface BorrowDetail {
  id: string;
  status: string;
  items?: BorrowItem[];
}

export function BorrowHandoverPanel({ borrow }: { borrow: BorrowDetail }) {
  const t = useTranslations();
  const [allocations, setAllocations] = useState<Record<string, Set<string>>>({});
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [conditionOut, setConditionOut] = useState("good");
  const handover = useGenericLifecycle("borrow", borrow.id, "handover");

  function toggle(modelId: string, unitId: string) {
    setAllocations((a) => {
      const cur = new Set(a[modelId] ?? []);
      cur.has(unitId) ? cur.delete(unitId) : cur.add(unitId);
      return { ...a, [modelId]: cur };
    });
  }

  function submit() {
    const allocation = Object.entries(allocations).map(([modelId, set]) => ({
      modelId,
      unitIds: [...set],
    }));
    handover.mutate(
      {
        allocation,
        conditionOut,
        pickupPhotoFileIds: photos.map((p) => p.fileId).filter(Boolean),
      },
      {
        onSuccess: () => toast.success("Handover recorded"),
        onError: (e) => {
          const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
          toast.error(t(i18n as never));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>{t("borrow.handover.title")}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>{t("borrow.handover.allocateUnits")}</Label>
          {(borrow.items ?? []).map((it) => (
            <div key={it.modelId} className="rounded-DEFAULT border border-line p-3">
              <p className="text-body-sm font-medium text-ink">{it.modelName}</p>
              <p className="text-caption text-ink-3">Need {it.quantity}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(it.candidateUnits ?? []).map((u) => {
                  const sel = (allocations[it.modelId] ?? new Set<string>()).has(u.id);
                  return (
                    <label key={u.id} className={`flex items-center gap-2 rounded-sm border px-2 py-1 text-caption ${sel ? "border-brand-blue bg-brand-blue-50" : "border-line"}`}>
                      <Checkbox checked={sel} onCheckedChange={() => toggle(it.modelId, u.id)} />
                      <span className="font-mono">{u.serialNumber ?? u.assetTag ?? u.id.slice(0, 8)}</span>
                    </label>
                  );
                })}
                {(it.candidateUnits ?? []).length === 0 ? (
                  <Badge variant="red">No candidate units</Badge>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <Label>{t("borrow.handover.conditionOut")}</Label>
          <Select value={conditionOut} onValueChange={setConditionOut}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["excellent", "good", "fair", "broken"].map((c) => (
                <SelectItem key={c} value={c}>{t(`asset.condition.${c}` as never)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>{t("borrow.handover.uploadPickupPhotos")}</Label>
          <PhotoGallery value={photos} onChange={setPhotos} kind="handover_photo" />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={handover.isPending}>{t("borrow.actions.handover")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BorrowReturnPanel({ borrowId }: { borrowId: string }) {
  const t = useTranslations();
  const [conditionIn, setConditionIn] = useState("good");
  const [damageReported, setDamage] = useState(false);
  const [damageNote, setDamageNote] = useState("");
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const ret = useGenericLifecycle("borrow", borrowId, "return");

  function submit() {
    ret.mutate(
      {
        conditionIn,
        damageReported,
        damageNote: damageReported ? damageNote : undefined,
        returnPhotoFileIds: photos.map((p) => p.fileId).filter(Boolean),
      },
      {
        onSuccess: () => toast.success("Return recorded"),
        onError: (e) => {
          const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
          toast.error(t(i18n as never));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>{t("borrow.return.title")}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{t("borrow.return.conditionIn")}</Label>
            <Select value={conditionIn} onValueChange={setConditionIn}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["excellent", "good", "fair", "broken"].map((c) => (
                  <SelectItem key={c} value={c}>{t(`asset.condition.${c}` as never)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-7">
            <Checkbox checked={damageReported} onCheckedChange={(c) => setDamage(c === true)} id="damage" />
            <Label htmlFor="damage">{t("borrow.return.damageReported")}</Label>
          </div>
        </div>
        {damageReported ? (
          <div className="space-y-1">
            <Label>{t("borrow.return.damageNote")}</Label>
            <Textarea value={damageNote} onChange={(e) => setDamageNote(e.target.value)} />
          </div>
        ) : null}
        <div className="space-y-1">
          <Label>{t("borrow.return.uploadReturnPhotos")}</Label>
          <PhotoGallery value={photos} onChange={setPhotos} kind="handover_photo" />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={ret.isPending}>{t("borrow.actions.markReturned")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
