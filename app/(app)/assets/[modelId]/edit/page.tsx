"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssetForm } from "@/components/assets/AssetForm";
import { useAssetDetail } from "@/lib/api/hooks/assets";

export default function EditAssetPage({ params }: { params: Promise<{ modelId: string }> }) {
  const { modelId } = use(params);
  const t = useTranslations();
  const { data, isLoading } = useAssetDetail(modelId);
  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;
  return (
    <div className="ds-container">
      <PageHeader title={`${t("common.edit")}: ${data.name}`} />
      <AssetForm initial={data} />
    </div>
  );
}
