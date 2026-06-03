"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DecisionPanel } from "@/components/requests/DecisionPanel";
import { useRequestDetail, useGenericLifecycle } from "@/lib/api/hooks/requests";

interface GeneralDetail {
  id: string;
  ticketNumber: string;
  status: string;
  title?: string;
  description?: string;
  requester?: { name?: string; email?: string };
  attachments?: Array<{ id: string; url: string; name?: string }>;
}

export default function GeneralDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const { data, isLoading } = useRequestDetail<GeneralDetail>("general", id);
  const close = useGenericLifecycle("general", id, "close");
  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;
  const pending = data.status === "submitted" || data.status === "in_review";

  return (
    <div className="ds-container space-y-6">
      <PageHeader title={`${t("general.title")} · ${data.ticketNumber}`} actions={<StatusBadge domain="general" status={data.status} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Ticket"><TicketNumber value={data.ticketNumber} /></Field>
            <Field label="Requester">{data.requester?.name ?? data.requester?.email ?? "—"}</Field>
            {data.title ? <Field label={t("general.requestTitle")}>{data.title}</Field> : null}
            {data.description ? <Field label={t("general.requestDescription")}>{data.description}</Field> : null}
            {(data.attachments?.length ?? 0) > 0 ? (
              <Field label={t("general.attachments")}>
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
          {pending ? <DecisionPanel kind="general" id={id} /> : null}
          {data.status === "approved" ? (
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
