"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRequestDecision, type RequestKind } from "@/lib/api/hooks/requests";
import { ApiError } from "@/lib/api/errors";

interface Props {
  kind: RequestKind;
  id: string;
  /** Render extra context (e.g. needs-admin badge) above the decision actions. */
  extra?: React.ReactNode;
  /** Hide the panel after a decision is rendered. */
  disabled?: boolean;
}

export function DecisionPanel({ kind, id, extra, disabled }: Props) {
  const t = useTranslations();
  const [comment, setComment] = useState("");
  const m = useRequestDecision(kind, id);

  function go(decision: "approved" | "rejected") {
    m.mutate(
      { decision, comment: comment || undefined },
      {
        onSuccess: () => toast.success(decision === "approved" ? t("common.approve") : t("common.reject")),
        onError: (e) => {
          const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
          toast.error(t(i18n as never));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Decision</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {extra}
        <Textarea placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="destructive" disabled={disabled || m.isPending} onClick={() => go("rejected")}>
            {t("common.reject")}
          </Button>
          <Button variant="success" disabled={disabled || m.isPending} onClick={() => go("approved")}>
            {t("common.approve")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
