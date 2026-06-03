"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssetForm } from "@/components/assets/AssetForm";

export default function NewAssetPage() {
  const t = useTranslations();
  return (
    <div className="ds-container">
      <PageHeader title={`${t("common.create")} ${t("asset.model")}`} />
      <AssetForm />
    </div>
  );
}
