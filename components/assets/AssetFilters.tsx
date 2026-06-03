"use client";

import { useTranslations } from "next-intl";
import { useCategories } from "@/lib/api/hooks/assets";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AssetListFilters } from "@/lib/api/hooks/assets";

interface Props {
  value: AssetListFilters;
  onChange: (next: AssetListFilters) => void;
}

export function AssetFilters({ value, onChange }: Props) {
  const t = useTranslations();
  const { data: categories } = useCategories();
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        type="search"
        placeholder={t("common.search")}
        value={value.q ?? ""}
        onChange={(e) => onChange({ ...value, q: e.target.value || undefined })}
      />
      <Select value={value.categorySlug ?? "_all"} onValueChange={(v) => onChange({ ...value, categorySlug: v === "_all" ? undefined : v })}>
        <SelectTrigger><SelectValue placeholder={t("asset.category")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t("common.all")}</SelectItem>
          {(categories ?? []).map((c) => (
            <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.status ?? "_all"} onValueChange={(v) => onChange({ ...value, status: v === "_all" ? undefined : v })}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t("common.all")}</SelectItem>
          <SelectItem value="available">{t("asset.status.available")}</SelectItem>
          <SelectItem value="reserved">{t("asset.status.reserved")}</SelectItem>
          <SelectItem value="borrowed">{t("asset.status.borrowed")}</SelectItem>
          <SelectItem value="in_maintenance">{t("asset.status.in_maintenance")}</SelectItem>
          <SelectItem value="retired">{t("asset.status.retired")}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={value.condition ?? "_all"} onValueChange={(v) => onChange({ ...value, condition: v === "_all" ? undefined : v })}>
        <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t("common.all")}</SelectItem>
          <SelectItem value="excellent">{t("asset.condition.excellent")}</SelectItem>
          <SelectItem value="good">{t("asset.condition.good")}</SelectItem>
          <SelectItem value="fair">{t("asset.condition.fair")}</SelectItem>
          <SelectItem value="broken">{t("asset.condition.broken")}</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder={t("asset.location.room")}
        value={value.locationRoom ?? ""}
        onChange={(e) => onChange({ ...value, locationRoom: e.target.value || undefined })}
      />
    </div>
  );
}
