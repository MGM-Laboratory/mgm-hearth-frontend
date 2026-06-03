"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportDropzone } from "@/components/assets/ImportDropzone";
import { ImportResultTable } from "@/components/assets/ImportResultTable";
import { useAssetImport, type ImportResult } from "@/lib/api/hooks/import";
import { ApiError } from "@/lib/api/errors";

export default function ImportPage() {
  const t = useTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const importer = useAssetImport();

  function go(dryRun: boolean) {
    if (!file) return;
    importer.mutate(
      { file, dryRun },
      {
        onSuccess: (r) => {
          setResult(r);
          if (!dryRun) toast.success(t("asset.import.result", { modelsCreated: r.modelsCreated, unitsCreated: r.unitsCreated, errors: r.errors.length }));
        },
        onError: (e) => {
          const i18n = e instanceof ApiError ? e.i18nKey : "errors.internalError";
          toast.error(t(i18n as never));
        },
      },
    );
  }

  return (
    <div className="ds-container space-y-6">
      <PageHeader title={t("asset.import.title")} description="Upload CSV or XLSX. Always dry-run first." />
      <Card>
        <CardHeader><CardTitle>1. Select file</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ImportDropzone onFile={(f) => { setFile(f); setResult(null); }} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={!file || importer.isPending} onClick={() => go(true)}>{t("asset.import.dryRun")}</Button>
            <Button disabled={!file || importer.isPending || !result || result.errors.length > 0} onClick={() => go(false)}>{t("common.submit")}</Button>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent><ImportResultTable result={result} /></CardContent>
        </Card>
      ) : null}
    </div>
  );
}
