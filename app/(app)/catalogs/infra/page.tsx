"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfraCatalogTable } from "@/components/catalogs/InfraCatalogTable";

export default function InfraCatalogPage() {
  const t = useTranslations();
  return (
    <div className="ds-container space-y-4">
      <PageHeader title={`${t("infra.title")} catalog`} />
      <InfraCatalogTable />
    </div>
  );
}
