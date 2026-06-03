"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DateTime } from "@/components/shared/DateTime";
import { DecisionPanel } from "@/components/requests/DecisionPanel";
import { BorrowHandoverPanel, BorrowReturnPanel } from "@/components/requests/BorrowPanels";
import { useRequestDetail } from "@/lib/api/hooks/requests";

interface BorrowItem {
  modelId: string;
  modelName: string;
  quantity: number;
  candidateUnits?: Array<{ id: string; serialNumber?: string; assetTag?: string }>;
}

interface BorrowDetail {
  id: string;
  ticketNumber: string;
  status: string;
  requester?: { name?: string; email?: string; strikes?: number };
  pickupDate?: string;
  expectedReturnAt?: string;
  purpose?: string;
  daysOverdue?: number;
  items?: BorrowItem[];
}

export default function BorrowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const { data, isLoading } = useRequestDetail<BorrowDetail>("borrow", id);

  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;

  const isPending = data.status === "submitted";
  const isReadyForHandover = data.status === "approved" || data.status === "ready_for_pickup";
  const isReturning = data.status === "borrowed" || data.status === "overdue";

  return (
    <div className="ds-container space-y-6">
      <PageHeader
        title={`${t("borrow.title")} · ${data.ticketNumber}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge domain="borrow" status={data.status} />
            {data.status === "overdue" && data.daysOverdue ? (
              <Badge variant="red">{data.daysOverdue}d overdue</Badge>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Ticket"><TicketNumber value={data.ticketNumber} /></Field>
            <Field label="Requester">
              {data.requester?.name ?? data.requester?.email ?? "—"}
              {data.requester?.strikes ? <Badge variant="yellow" className="ml-2">{data.requester.strikes} strikes</Badge> : null}
            </Field>
            {data.purpose ? <Field label={t("borrow.purpose")}>{data.purpose}</Field> : null}
            {data.pickupDate ? <Field label={t("borrow.pickupDate")}><DateTime value={data.pickupDate} /></Field> : null}
            {data.expectedReturnAt ? <Field label={t("borrow.expectedReturnAt")}><DateTime value={data.expectedReturnAt} /></Field> : null}
            <Field label={t("borrow.items")}>
              <ul className="space-y-1">
                {(data.items ?? []).map((it) => (
                  <li key={it.modelId} className="text-body-sm">
                    {it.quantity}× <span className="text-ink">{it.modelName}</span>
                  </li>
                ))}
              </ul>
            </Field>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isPending ? <DecisionPanel kind="borrow" id={id} /> : null}
          {isReadyForHandover ? <BorrowHandoverPanel borrow={data} /> : null}
          {isReturning ? <BorrowReturnPanel borrowId={id} /> : null}
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
