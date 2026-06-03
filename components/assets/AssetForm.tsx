"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useCategoryCustomFields, useCreateAssetModel, useUpdateAssetModel, type AssetModelDetail } from "@/lib/api/hooks/assets";
import { CustomFieldsForm } from "./CustomFieldsForm";
import { TagPicker } from "./TagPicker";
import { CompanionPicker } from "./CompanionPicker";
import { PhotoGallery, type GalleryItem } from "./PhotoGallery";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { ApiError } from "@/lib/api/errors";

interface Props {
  initial?: AssetModelDetail;
}

export function AssetForm({ initial }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category?.id ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(initial?.customValues ?? {});
  const [companions, setCompanions] = useState(initial?.companions?.map((c) => ({ id: c.id, name: c.name, coverPhotoUrl: c.coverPhotoUrl })) ?? []);
  const [gallery, setGallery] = useState<GalleryItem[]>(initial?.photos ?? []);
  const [sopHtml, setSopHtml] = useState(initial?.usageSopHtml ?? "");

  const { data: customFields = [] } = useCategoryCustomFields(categoryId);
  const create = useCreateAssetModel();
  const update = useUpdateAssetModel(initial?.id ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      name,
      description: description || undefined,
      categoryId: categoryId || undefined,
      tags,
      customValues,
      companionIds: companions.map((c) => c.id),
      photoFileIds: gallery.map((g) => g.fileId).filter(Boolean),
      usageSopHtml: sopHtml || undefined,
    };
    const onError = (e: unknown) => {
      const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
      toast.error(t(i18n as never));
    };
    if (initial?.id) {
      update.mutate(body, {
        onSuccess: (m) => {
          toast.success("Saved");
          router.push(`/assets/${m.id}`);
        },
        onError,
      });
    } else {
      create.mutate(body, {
        onSuccess: (m) => {
          toast.success("Created");
          router.push(`/assets/${m.id}`);
        },
        onError,
      });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cat">{t("asset.category")}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="cat"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t("asset.tags")}</Label>
            <TagPicker value={tags} onChange={setTags} />
          </div>
        </CardContent>
      </Card>

      {categoryId && customFields.length > 0 ? (
        <Card>
          <CardHeader><CardTitle>Custom fields</CardTitle></CardHeader>
          <CardContent>
            <CustomFieldsForm fields={customFields} values={customValues} onChange={setCustomValues} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>{t("asset.usageSop")}</CardTitle></CardHeader>
        <CardContent>
          <RichTextEditor value={sopHtml} onChange={setSopHtml} placeholder="How to use this asset…" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Gallery</CardTitle></CardHeader>
        <CardContent>
          <PhotoGallery value={gallery} onChange={setGallery} kind="asset_photo" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("asset.companions")}</CardTitle></CardHeader>
        <CardContent>
          <CompanionPicker value={companions} onChange={setCompanions} excludeModelId={initial?.id} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>{t("common.cancel")}</Button>
        <Button type="submit" disabled={create.isPending || update.isPending}>{t("common.save")}</Button>
      </div>
    </form>
  );
}
