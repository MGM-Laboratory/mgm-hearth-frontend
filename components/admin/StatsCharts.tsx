"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStats } from "@/lib/api/hooks/dashboard";

export function StatsCharts({ stats }: { stats: AdminStats }) {
  const mostBorrowed = stats.mostBorrowedModels ?? [];
  const utilization = stats.utilizationByCategory ?? [];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Most borrowed models</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {mostBorrowed.length === 0 ? (
            <p className="text-body-sm text-ink-3">No data.</p>
          ) : (
            <ResponsiveContainer>
              <BarChart data={mostBorrowed}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="modelName" stroke="var(--ink-3)" fontSize={11} />
                <YAxis stroke="var(--ink-3)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}
                />
                <Bar dataKey="borrowCount" fill="var(--brand-blue)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilization by category</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {utilization.length === 0 ? (
            <p className="text-body-sm text-ink-3">No data.</p>
          ) : (
            <ResponsiveContainer>
              <BarChart data={utilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="category" stroke="var(--ink-3)" fontSize={11} />
                <YAxis stroke="var(--ink-3)" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}
                />
                <Bar dataKey="utilization" fill="var(--brand-green)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Overdue rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-display-lg text-ink">{(stats.overdueRatePct ?? 0).toFixed(1)}%</p>
          <p className="mt-1 text-body-sm text-ink-3">
            {stats.totalActiveBorrows ?? 0} active borrows · {stats.totalAssetUnits ?? 0} asset units
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
