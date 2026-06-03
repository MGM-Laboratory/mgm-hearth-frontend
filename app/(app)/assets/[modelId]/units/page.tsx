"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { UnitTable } from "@/components/assets/UnitTable";
import { useAssetDetail } from "@/lib/api/hooks/assets";

export default function UnitsPage({ params }: { params: Promise<{ modelId: string }> }) {
  const { modelId } = use(params);
  const t = useTranslations();
  const { data, isLoading } = useAssetDetail(modelId);
  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;
  return (
    <div className="ds-container space-y-4">
      <PageHeader title={`${data.name} · Units`} />
      <UnitTable modelId={modelId} units={data.units ?? []} />
    </div>
  );
}
