"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketNumber } from "@/components/shared/TicketNumber";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DateTime } from "@/components/shared/DateTime";
import { DecisionPanel } from "@/components/requests/DecisionPanel";
import { RoomCalendar } from "@/components/requests/RoomCalendar";
import { useRequestDetail } from "@/lib/api/hooks/requests";

interface RoomBookingDetail {
  id: string;
  ticketNumber: string;
  status: string;
  room?: { id: string; name: string };
  startAt?: string;
  endAt?: string;
  attendees?: number;
  purpose?: string;
  requester?: { name?: string; email?: string };
}

export default function RoomBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const { data, isLoading } = useRequestDetail<RoomBookingDetail>("room", id);
  if (isLoading || !data) return <p className="ds-container text-body-sm text-ink-3">{t("common.loading")}</p>;
  const pending = data.status === "pending";

  return (
    <div className="ds-container space-y-6">
      <PageHeader
        title={`${t("room.title")} · ${data.ticketNumber}`}
        actions={<StatusBadge domain="room" status={data.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Ticket"><TicketNumber value={data.ticketNumber} /></Field>
            <Field label="Requester">{data.requester?.name ?? data.requester?.email ?? "—"}</Field>
            <Field label={t("room.room")}>{data.room?.name ?? "—"}</Field>
            <div className="grid grid-cols-2 gap-3">
              {data.startAt ? <Field label={t("room.startAt")}><DateTime value={data.startAt} variant="long" /></Field> : null}
              {data.endAt ? <Field label={t("room.endAt")}><DateTime value={data.endAt} variant="long" /></Field> : null}
            </div>
            {data.attendees ? <Field label={t("room.attendees")}>{data.attendees}</Field> : null}
            {data.purpose ? <Field label="Purpose">{data.purpose}</Field> : null}
          </CardContent>
        </Card>
        <div className="space-y-4">
          {pending ? <DecisionPanel kind="room" id={id} /> : null}
        </div>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Room availability</CardTitle></CardHeader>
          <CardContent><RoomCalendar roomId={data.room?.id} /></CardContent>
        </Card>
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
