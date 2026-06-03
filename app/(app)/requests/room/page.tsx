"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequestQueues } from "@/components/requests/RequestQueues";
import { RoomCalendar } from "@/components/requests/RoomCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoomBookingPage() {
  const t = useTranslations();
  return (
    <div className="ds-container space-y-6">
      <PageHeader title={t("room.title")} />
      <Card>
        <CardHeader><CardTitle>{t("room.availability.title")}</CardTitle></CardHeader>
        <CardContent>
          <RoomCalendar />
        </CardContent>
      </Card>
      <RequestQueues kind="room" basePath="/requests/room" />
    </div>
  );
}
