"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminOnly } from "@/lib/auth/roles";

export default function AdminSettingsPage() {
  const t = useTranslations();
  return (
    <div className="ds-container space-y-4">
      <PageHeader title={t("nav.settings")} />
      <AdminOnly fallback={<p className="text-body-sm text-ink-3">Admin only.</p>}>
        <SettingsForm />
      </AdminOnly>
    </div>
  );
}
