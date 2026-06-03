"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";

export interface ImportRowError {
  row: number;
  field?: string;
  message: string;
}

export interface ImportResult {
  dryRun: boolean;
  modelsCreated: number;
  unitsCreated: number;
  errors: ImportRowError[];
  warnings?: string[];
}

export function useAssetImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, dryRun }: { file: File; dryRun: boolean }) => {
      const form = new FormData();
      form.append("file", file);
      const url = `/assets/import${dryRun ? "?dryRun=true" : ""}`;
      const res = await rawFetch(url, { method: "POST", body: form });
      return (await res.json()) as ImportResult;
    },
    onSuccess: (r) => {
      if (!r.dryRun) qc.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
