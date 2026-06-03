"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { StickerTemplateTable } from "@/components/catalogs/StickerTemplateTable";

export default function StickerTemplatesPage() {
  const t = useTranslations();
  return (
    <div className="ds-container space-y-4">
      <PageHeader title="Sticker templates" />
      <StickerTemplateTable />
    </div>
  );
}
