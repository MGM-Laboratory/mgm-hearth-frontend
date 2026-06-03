"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCharts } from "@/components/admin/StatsCharts";
import { AdminOnly } from "@/lib/auth/roles";
import { useAdminStats } from "@/lib/api/hooks/dashboard";

export default function AdminStatsPage() {
  const { data, isLoading } = useAdminStats(30);
  return (
    <div className="ds-container space-y-4">
      <PageHeader title="Reporting" description="Last 30 days — view only." />
      <AdminOnly fallback={<p className="text-body-sm text-ink-3">Admin only.</p>}>
        {isLoading || !data ? <p className="text-body-sm text-ink-3">Loading…</p> : <StatsCharts stats={data} />}
      </AdminOnly>
    </div>
  );
}
