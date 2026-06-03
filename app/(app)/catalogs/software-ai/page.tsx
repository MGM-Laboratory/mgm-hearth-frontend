"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { SoftwareCatalogTable } from "@/components/catalogs/SoftwareCatalogTable";

export default function SoftwareCatalogPage() {
  const t = useTranslations();
  return (
    <div className="ds-container space-y-4">
      <PageHeader title={`${t("license.title")} catalog`} />
      <SoftwareCatalogTable />
    </div>
  );
}
