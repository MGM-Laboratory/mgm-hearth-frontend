"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequestQueues } from "@/components/requests/RequestQueues";

export default function GeneralPage() {
  const t = useTranslations();
  return (
    <div className="ds-container space-y-4">
      <PageHeader title={t("general.title")} />
      <RequestQueues kind="general" basePath="/requests/general" />
    </div>
  );
}
