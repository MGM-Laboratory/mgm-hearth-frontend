"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGenericLifecycle } from "@/lib/api/hooks/requests";
import { ApiError } from "@/lib/api/errors";

export function ProcurementLifecycle({ id, status }: { id: string; status: string }) {
  const t = useTranslations();
  const order = useGenericLifecycle("procurement", id, "order");
  const receive = useGenericLifecycle("procurement", id, "receive");
  const close = useGenericLifecycle("procurement", id, "close");

  const onError = (e: unknown) => {
    const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
    toast.error(t(i18n as never));
  };

  if (status === "approved") {
    return (
      <Card>
        <CardHeader><CardTitle>{t("procurement.actions.markOrdered")}</CardTitle></CardHeader>
        <CardContent className="flex justify-end">
          <Button onClick={() => order.mutate({}, { onError })}>{t("procurement.actions.markOrdered")}</Button>
        </CardContent>
      </Card>
    );
  }
  if (status === "ordered") {
    return (
      <Card>
        <CardHeader><CardTitle>{t("procurement.actions.markReceived")}</CardTitle></CardHeader>
        <CardContent className="flex justify-end">
          <Button onClick={() => receive.mutate({}, { onError })}>{t("procurement.actions.markReceived")}</Button>
        </CardContent>
      </Card>
    );
  }
  if (status === "received") {
    return (
      <Card>
        <CardHeader><CardTitle>{t("procurement.actions.close")}</CardTitle></CardHeader>
        <CardContent className="flex justify-end">
          <Button onClick={() => close.mutate({}, { onError })}>{t("procurement.actions.close")}</Button>
        </CardContent>
      </Card>
    );
  }
  return null;
}
