"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export interface InfraCatalogItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  active: boolean;
}

export function useInfraCatalog() {
  return useQuery({
    queryKey: queryKeys.infra.catalog(),
    queryFn: async () => {
      const res = await rawFetch("/infra-catalog");
      const json = (await res.json()) as { data?: InfraCatalogItem[] };
      return json.data ?? [];
    },
  });
}

export function useUpsertInfraCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<InfraCatalogItem> & { id?: string }) => {
      const path = body.id ? `/infra-catalog/${body.id}` : "/infra-catalog";
      const res = await rawFetch(path, {
        method: body.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as InfraCatalogItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.infra.catalog() }),
  });
}

export function useDeleteInfraCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await rawFetch(`/infra-catalog/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.infra.catalog() }),
  });
}

export interface LicenseCatalogItem {
  id: string;
  name: string;
  kind: "software" | "ai";
  category?: string;
  hasCodeVersion?: boolean;
  seatLimit?: number;
  logoUrl?: string;
  logoFileId?: string;
}

export function useLicenseCatalog(kind?: string) {
  return useQuery({
    queryKey: queryKeys.license.catalog(kind),
    queryFn: async () => {
      const path = kind ? `/license-catalog?kind=${kind}` : "/license-catalog";
      const res = await rawFetch(path);
      const json = (await res.json()) as { data?: LicenseCatalogItem[] };
      return json.data ?? [];
    },
  });
}

export function useUpsertLicenseCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<LicenseCatalogItem> & { id?: string }) => {
      const path = body.id ? `/license-catalog/${body.id}` : "/license-catalog";
      const res = await rawFetch(path, {
        method: body.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as LicenseCatalogItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.license.catalog() }),
  });
}

export function useDeleteLicenseCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await rawFetch(`/license-catalog/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.license.catalog() }),
  });
}
