"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Trash2, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/Icon";
import { Badge } from "@/components/ui/badge";
import { UnitTable } from "@/components/assets/UnitTable";
import { Timeline } from "@/components/assets/Timeline";
import { MaintenanceSchedules } from "@/components/assets/MaintenanceSchedules";
import { DepreciationCard } from "@/components/assets/DepreciationCard";
import { BatchStickerDialog } from "@/components/assets/BatchStickerDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAssetDetail, useDeleteAssetModel } from "@/lib/api/hooks/assets";

export default function AssetDetailPage({ params }: { params: Promise<{ modelId: string }> }) {
  const { modelId } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useAssetDetail(modelId);
  const del = useDeleteAssetModel();

  if (isLoading) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;
  if (error) return <div className="ds-container"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  if (!data) return null;

  const firstUnit = data.units?.[0];

  return (
    <div className="ds-container space-y-6">
      <PageHeader
        title={data.name}
        eyebrow={data.category?.name}
        description={data.description}
        actions={
          <div className="flex gap-2">
            <BatchStickerDialog units={data.units ?? []}>
              <Button variant="secondary"><Icon icon={Printer} size={16} /> Stickers</Button>
            </BatchStickerDialog>
            <Button variant="secondary" asChild>
              <Link href={`/assets/${modelId}/edit`}>
                <Icon icon={Pencil} size={16} /> {t("common.edit")}
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm(`Delete model "${data.name}"?`)) {
                  del.mutate(modelId, { onSuccess: () => router.push("/assets") });
                }
              }}
            >
              <Icon icon={Trash2} size={16} /> {t("common.delete")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Gallery</CardTitle></CardHeader>
          <CardContent>
            {(data.photos?.length ?? 0) === 0 ? (
              <p className="text-body-sm text-ink-3">No photos uploaded.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                {(data.photos ?? []).map((p) => (
                  <div key={p.id} className="aspect-square overflow-hidden rounded-DEFAULT border border-line">
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("asset.tags")}</CardTitle></CardHeader>
          <CardContent>
            {(data.tags?.length ?? 0) === 0 ? (
              <p className="text-body-sm text-ink-3">{t("common.empty")}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(data.tags ?? []).map((tg) => <Badge key={tg} variant="default">{tg}</Badge>)}
              </div>
            )}
          </CardContent>
        </Card>

        {data.usageSopHtml ? (
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>{t("asset.usageSop")}</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-prose" dangerouslySetInnerHTML={{ __html: data.usageSopHtml }} />
            </CardContent>
          </Card>
        ) : null}

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Units</CardTitle></CardHeader>
          <CardContent>
            <UnitTable modelId={modelId} units={data.units ?? []} />
          </CardContent>
        </Card>

        {firstUnit ? <DepreciationCard unit={firstUnit} /> : null}

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
          <CardContent><Timeline modelId={modelId} /></CardContent>
        </Card>

        <MaintenanceSchedules modelId={modelId} units={data.units ?? []} />

        {(data.companions?.length ?? 0) > 0 ? (
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>{t("asset.companions")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(data.companions ?? []).map((c) => (
                  <Link key={c.id} href={`/assets/${c.id}`} className="ds-card flex items-center gap-3 p-3 transition-shadow hover:shadow-2">
                    {c.coverPhotoUrl ? <img src={c.coverPhotoUrl} alt="" className="h-10 w-10 rounded-sm object-cover" /> : <div className="h-10 w-10 rounded-sm bg-surface-muted" />}
                    <span className="truncate text-body-sm text-ink">{c.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
