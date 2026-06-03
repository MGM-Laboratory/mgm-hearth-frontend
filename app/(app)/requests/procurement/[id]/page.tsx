"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DateTime } from "@/components/shared/DateTime";
import { Money } from "@/components/shared/Money";
import { DecisionPanel } from "@/components/requests/DecisionPanel";
import { ProcurementLifecycle } from "@/components/requests/ProcurementLifecycle";
import { useRequestDetail } from "@/lib/api/hooks/requests";
import { useIsAdmin } from "@/lib/auth/roles";

interface ProcurementItem {
  name: string;
  quantity: number;
  unitPriceIdr: number;
  productLink?: string;
}

interface ProcurementDetail {
  id: string;
  ticketNumber: string;
  status: string;
  requester?: { name?: string; email?: string };
  needsAdminApproval?: boolean;
  totalEstimateIdr?: number;
  neededBy?: string;
  justification?: string;
  items?: ProcurementItem[];
  attachments?: Array<{ id: string; url: string; name?: string }>;
}

export default function ProcurementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const isAdmin = useIsAdmin();
  const { data, isLoading } = useRequestDetail<ProcurementDetail>("procurement", id);
  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;

  const pending = data.status === "submitted" || data.status === "in_review";
  const blockedByAdmin = pending && data.needsAdminApproval && !isAdmin;

  return (
    <div className="ds-container space-y-6">
      <PageHeader
        title={`${t("procurement.title")} · ${data.ticketNumber}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge domain="procurement" status={data.status} />
            {data.needsAdminApproval ? <Badge variant="yellow">{t("procurement.needsAdminApproval")}</Badge> : null}
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Ticket"><TicketNumber value={data.ticketNumber} /></Field>
            <Field label="Requester">{data.requester?.name ?? data.requester?.email ?? "—"}</Field>
            {data.justification ? <Field label={t("procurement.justification")}>{data.justification}</Field> : null}
            {data.neededBy ? <Field label={t("procurement.neededBy")}><DateTime value={data.neededBy} /></Field> : null}
            <Field label={t("procurement.totalEstimate")}>{data.totalEstimateIdr ? <Money amount={data.totalEstimateIdr} /> : "—"}</Field>
            <Field label="Items">
              <ul className="space-y-1">
                {(data.items ?? []).map((it, i) => (
                  <li key={i} className="flex items-center justify-between text-body-sm">
                    <span className="text-ink">{it.quantity}× {it.name}</span>
                    <span className="font-mono text-caption text-ink-2"><Money amount={it.unitPriceIdr * it.quantity} /></span>
                  </li>
                ))}
              </ul>
            </Field>
            {(data.attachments?.length ?? 0) > 0 ? (
              <Field label={t("procurement.attachments")}>
                <ul className="space-y-1">
                  {(data.attachments ?? []).map((a) => (
                    <li key={a.id}><a href={a.url} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">{a.name ?? a.url}</a></li>
                  ))}
                </ul>
              </Field>
            ) : null}
          </CardContent>
        </Card>
        <div className="space-y-4">
          {pending ? (
            <DecisionPanel
              kind="procurement"
              id={id}
              disabled={blockedByAdmin}
              extra={blockedByAdmin ? <Badge variant="red">Admin approval required</Badge> : null}
            />
          ) : null}
          <ProcurementLifecycle id={id} status={data.status} />
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
