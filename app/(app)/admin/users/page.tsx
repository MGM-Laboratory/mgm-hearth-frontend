"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersTable } from "@/components/admin/UsersTable";
import { AdminOnly } from "@/lib/auth/roles";

export default function AdminUsersPage() {
  const t = useTranslations();
  return (
    <div className="ds-container space-y-4">
      <PageHeader title={t("nav.users")} />
      <AdminOnly fallback={<p className="text-body-sm text-ink-3">Admin only.</p>}>
        <UsersTable />
      </AdminOnly>
    </div>
  );
}
