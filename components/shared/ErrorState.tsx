"use client";

import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations();
  const i18nKey = error instanceof ApiError ? error.i18nKey : "errors.internalError";
  return (
    <div className="rounded-DEFAULT border border-brand-red-50 bg-brand-red-50 p-5">
      <p className="text-body font-medium text-ink">{t(i18nKey as never)}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
          {t("common.tryAgain")}
        </Button>
      ) : null}
    </div>
  );
}
