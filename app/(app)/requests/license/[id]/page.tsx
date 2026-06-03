"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DecisionPanel } from "@/components/requests/DecisionPanel";
import { LicenseSeatAssign } from "@/components/requests/LicenseSeatAssign";
import { useRequestDetail, useGenericLifecycle } from "@/lib/api/hooks/requests";

interface LicenseItem {
  id: string;
  name: string;
  kind: "software" | "ai";
  hasCodeVersion?: boolean;
  seatLimit?: number;
  seatsTaken?: number;
}

interface LicenseDetail {
  id: string;
  ticketNumber: string;
  status: string;
  requester?: { name?: string; email?: string };
  purpose?: string;
  periodMonths?: number;
  needsCodeVersion?: boolean;
  items?: LicenseItem[];
}

export default function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const { data, isLoading } = useRequestDetail<LicenseDetail>("license", id);
  const close = useGenericLifecycle("license", id, "close");
  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;
  const pending = data.status === "submitted" || data.status === "in_review";

  return (
    <div className="ds-container space-y-6">
      <PageHeader
        title={`${t("license.title")} · ${data.ticketNumber}`}
        actions={<StatusBadge domain="license" status={data.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Ticket"><TicketNumber value={data.ticketNumber} /></Field>
            <Field label="Requester">{data.requester?.name ?? data.requester?.email ?? "—"}</Field>
            {data.purpose ? <Field label={t("license.purpose")}>{data.purpose}</Field> : null}
            {data.periodMonths ? <Field label={t("license.periodMonths")}>{data.periodMonths}</Field> : null}
            {data.needsCodeVersion ? <Field label={t("license.needsCodeVersion")}><Badge variant="default">CLI</Badge></Field> : null}
            <Field label={t("license.selectedItems")}>
              <ul className="space-y-1">
                {(data.items ?? []).map((it) => (
                  <li key={it.id} className="flex items-center justify-between text-body-sm">
                    <span className="text-ink">{it.name}</span>
                    <span className="text-caption text-ink-3">
                      {t(`license.kind.${it.kind}` as never)}
                      {it.seatLimit !== undefined ? ` · ${it.seatsTaken ?? 0}/${it.seatLimit}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </Field>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {pending ? <DecisionPanel kind="license" id={id} /> : null}
          {data.status === "approved" ? (
            <LicenseSeatAssign
              licenseId={id}
              seatLimit={data.items?.[0]?.seatLimit}
              seatsTaken={data.items?.[0]?.seatsTaken}
            />
          ) : null}
          {data.status === "assigned" ? (
            <Card>
              <CardHeader><CardTitle>Close</CardTitle></CardHeader>
              <CardContent className="flex justify-end">
                <Button onClick={() => close.mutate({}, { onSuccess: () => toast.success("Closed") })}>Close</Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption text-ink-3">{label}</p>
      <div className="text-body-sm text-ink">{children}</div>
    </div>
  );
}
