"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGenericLifecycle } from "@/lib/api/hooks/requests";
import { ApiError } from "@/lib/api/errors";

interface Props {
  licenseId: string;
  seatLimit?: number;
  seatsTaken?: number;
}

export function LicenseSeatAssign({ licenseId, seatLimit, seatsTaken }: Props) {
  const t = useTranslations();
  const assign = useGenericLifecycle("license", licenseId, "assign");
  const [seatIdentifier, setSeat] = useState("");
  const available = seatLimit !== undefined && seatsTaken !== undefined ? seatLimit - seatsTaken : undefined;

  function submit() {
    assign.mutate(
      { seatIdentifier },
      {
        onSuccess: () => toast.success(t("license.seatAssigned")),
        onError: (e) => {
          const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
          toast.error(t(i18n as never));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>{t("license.assignSeat")}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {seatLimit !== undefined ? (
          <p className="text-caption text-ink-3">
            <Badge variant={available && available > 0 ? "green" : "red"}>
              {seatsTaken}/{seatLimit} seats used
            </Badge>
          </p>
        ) : null}
        <div className="space-y-1">
          <Label htmlFor="seat">Seat identifier</Label>
          <Input id="seat" value={seatIdentifier} onChange={(e) => setSeat(e.target.value)} placeholder="email or login" />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={!seatIdentifier || assign.isPending}>{t("license.assignSeat")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
