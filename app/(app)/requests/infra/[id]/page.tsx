"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Money } from "@/components/shared/Money";
import { DecisionPanel } from "@/components/requests/DecisionPanel";
import { InfraSpecWarnings } from "@/components/requests/InfraSpecWarnings";
import { useRequestDetail, useGenericLifecycle } from "@/lib/api/hooks/requests";

interface InfraDetail {
  id: string;
  ticketNumber: string;
  status: string;
  requester?: { name?: string; email?: string };
  purpose?: string;
  projectRepo?: string;
  vcpu?: number;
  ramGb?: number;
  storageGb?: number;
  autoscale?: boolean;
  autoscaleMaxInstances?: number;
  estimatedMonthlyCostIdr?: number;
  services?: Array<{ category: string; name: string; custom?: boolean }>;
  specWarnings?: string[];
}

export default function InfraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const { data, isLoading } = useRequestDetail<InfraDetail>("infra", id);
  const provision = useGenericLifecycle("infra", id, "provision");
  const close = useGenericLifecycle("infra", id, "close");
  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;

  const pending = data.status === "submitted" || data.status === "in_review";

  return (
    <div className="ds-container space-y-6">
      <PageHeader
        title={`${t("infra.title")} · ${data.ticketNumber}`}
        actions={<StatusBadge domain="infra" status={data.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Ticket"><TicketNumber value={data.ticketNumber} /></Field>
            <Field label="Requester">{data.requester?.name ?? data.requester?.email ?? "—"}</Field>
            {data.purpose ? <Field label={t("infra.purpose")}>{data.purpose}</Field> : null}
            {data.projectRepo ? <Field label={t("infra.projectRepo")}><a href={data.projectRepo} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">{data.projectRepo}</a></Field> : null}
            <div className="grid grid-cols-3 gap-3">
              {data.vcpu ? <Field label={t("infra.vcpu")}>{data.vcpu}</Field> : null}
              {data.ramGb ? <Field label={t("infra.ramGb")}>{data.ramGb}</Field> : null}
              {data.storageGb ? <Field label={t("infra.storageGb")}>{data.storageGb}</Field> : null}
            </div>
            {data.autoscale ? <Field label={t("infra.autoscale")}>Yes · max {data.autoscaleMaxInstances ?? "?"}</Field> : null}
            {data.estimatedMonthlyCostIdr ? <Field label={t("infra.estimatedMonthlyCost")}><Money amount={data.estimatedMonthlyCostIdr} /></Field> : null}
            {(data.services?.length ?? 0) > 0 ? (
              <Field label={t("infra.services")}>
                <ul className="space-y-1">
                  {(data.services ?? []).map((s, i) => (
                    <li key={i} className="text-body-sm text-ink">{s.name} <span className="text-caption text-ink-3">· {s.category}{s.custom ? " · custom" : ""}</span></li>
                  ))}
                </ul>
              </Field>
            ) : null}
            {(data.specWarnings?.length ?? 0) > 0 ? <InfraSpecWarnings warnings={data.specWarnings ?? []} /> : null}
          </CardContent>
        </Card>
        <div className="space-y-4">
          {pending ? <DecisionPanel kind="infra" id={id} /> : null}
          {data.status === "approved" ? (
            <Card>
              <CardHeader><CardTitle>Provision</CardTitle></CardHeader>
              <CardContent className="flex justify-end">
                <Button onClick={() => provision.mutate({}, { onSuccess: () => toast.success("Provisioned") })}>Mark provisioned</Button>
              </CardContent>
            </Card>
          ) : null}
          {data.status === "provisioned" ? (
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
