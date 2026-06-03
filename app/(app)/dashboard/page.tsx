"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarDays,
  KeySquare,
  PackageCheck,
  Server,
  ShoppingCart,
  Files,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/shared/Icon";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { DateTime } from "@/components/shared/DateTime";
import { AdminOnly } from "@/lib/auth/roles";
import { usePendingCounts, useOverdueBorrows, useUpcomingMaintenance, useAdminStats } from "@/lib/api/hooks/dashboard";
import { StatsCharts } from "@/components/admin/StatsCharts";

export default function DashboardPage() {
  const t = useTranslations();
  const { data: pending } = usePendingCounts();
  const { data: overdue = [] } = useOverdueBorrows();
  const { data: maintenance = [] } = useUpcomingMaintenance();

  const tiles = [
    { key: "borrow", href: "/requests/borrow", icon: PackageCheck, count: pending?.borrow ?? 0, label: t("nav.borrows") },
    { key: "procurement", href: "/requests/procurement", icon: ShoppingCart, count: pending?.procurement ?? 0, label: t("nav.procurement") },
    { key: "infra", href: "/requests/infra", icon: Server, count: pending?.infra ?? 0, label: t("nav.infra") },
    { key: "room", href: "/requests/room", icon: CalendarDays, count: pending?.room ?? 0, label: t("nav.rooms") },
    { key: "license", href: "/requests/license", icon: KeySquare, count: pending?.license ?? 0, label: t("nav.licenses") },
    { key: "general", href: "/requests/general", icon: Files, count: pending?.general ?? 0, label: t("nav.general") },
  ];

  return (
    <div className="ds-container space-y-8">
      <PageHeader
        title={t("nav.dashboard")}
        description="Approvals, returns and maintenance due today."
      />

      <section>
        <p className="mb-3 font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">Pending approvals</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {tiles.map((tile) => (
            <Link key={tile.key} href={tile.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-2">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <Icon icon={tile.icon} size={20} className="text-ink-2" />
                    <span className="text-caption text-ink-3">{tile.label}</span>
                  </div>
                  <p className="mt-3 font-mono text-display-lg text-ink">{tile.count}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={AlertTriangle} size={20} className="text-brand-red" />
              Overdue borrows
            </CardTitle>
            <CardDescription>Items not returned past their expected return date.</CardDescription>
          </CardHeader>
          <CardContent>
            {overdue.length === 0 ? (
              <p className="text-body-sm text-ink-3">{t("common.empty")}</p>
            ) : (
              <ul className="divide-y divide-line">
                {overdue.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2">
                    <div>
                      <TicketNumber value={o.ticketNumber} />
                      <p className="text-caption text-ink-3">{o.requesterName ?? "—"}</p>
                    </div>
                    <span className="font-mono text-caption text-brand-red">
                      {o.daysOverdue}d
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={Wrench} size={20} className="text-brand-yellow" />
              Maintenance due
            </CardTitle>
            <CardDescription>Schedules within the next 14 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {maintenance.length === 0 ? (
              <p className="text-body-sm text-ink-3">{t("common.empty")}</p>
            ) : (
              <ul className="divide-y divide-line">
                {maintenance.map((m) => (
                  <li key={m.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-body-sm text-ink">{m.assetName}</p>
                      <p className="text-caption text-ink-3">unit {m.unitId.slice(0, 8)}…</p>
                    </div>
                    <DateTime value={m.dueAt} className="font-mono text-caption text-ink-2" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <AdminOnly>
        <AdminStatsSection />
      </AdminOnly>
    </div>
  );
}

function AdminStatsSection() {
  const { data, isLoading } = useAdminStats(30);
  return (
    <section className="space-y-3">
      <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-ink-3">Admin stats (30 days)</p>
      {isLoading ? <p className="text-body-sm text-ink-3">Loading…</p> : data ? <StatsCharts stats={data} /> : null}
    </section>
  );
}
