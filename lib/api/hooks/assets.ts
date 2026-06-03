"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export interface AssetListFilters {
  q?: string;
  categorySlug?: string;
  tag?: string;
  status?: string;
  condition?: string;
  locationRoom?: string;
}

export interface AssetModelSummary {
  id: string;
  name: string;
  categoryName?: string;
  categorySlug?: string;
  tags?: string[];
  coverPhotoUrl?: string;
  unitCount?: number;
  availableCount?: number;
  status?: string;
}

export interface AssetUnit {
  id: string;
  modelId: string;
  serialNumber?: string;
  assetTag?: string;
  publicId: string;
  status: string;
  condition: string;
  location?: { room?: string; shelf?: string; cabinet?: string };
  purchase?: {
    price?: number;
    date?: string;
    usefulLifeMonths?: number;
    salvageValue?: number;
    depreciationMethod?: "straight_line" | "declining_balance" | "none";
  };
  currentHolder?: { id: string; name: string } | null;
  photos?: Array<{ id: string; url: string }>;
  internalNotes?: string;
}

export interface CategoryCustomField {
  id: string;
  key: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "date";
  options?: string[];
  required?: boolean;
  helpText?: string;
}

export interface AssetModelDetail {
  id: string;
  name: string;
  description?: string;
  category?: { id: string; slug: string; name: string };
  tags?: string[];
  customValues?: Record<string, unknown>;
  photos?: Array<{ id: string; url: string }>;
  companions?: Array<{ id: string; name: string; coverPhotoUrl?: string; publicHref?: string }>;
  usageSopHtml?: string;
  units?: AssetUnit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetListPage {
  data: AssetModelSummary[];
  pagination: { nextCursor?: string | null; hasMore?: boolean };
}

export function useAssetList(filters: AssetListFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.assets.list(filters as Record<string, unknown>),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.pagination?.nextCursor ?? undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v) params.set(k, String(v));
      }
      params.set("limit", "40");
      if (pageParam) params.set("cursor", pageParam);
      const res = await rawFetch(`/assets?${params.toString()}`);
      return (await res.json()) as AssetListPage;
    },
  });
}

export function useAssetDetail(modelId: string) {
  return useQuery({
    queryKey: queryKeys.assets.detail(modelId),
    queryFn: async () => {
      const res = await rawFetch(`/assets/${modelId}`);
      return (await res.json()) as AssetModelDetail;
    },
    enabled: !!modelId,
  });
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  customFields?: CategoryCustomField[];
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: async () => {
      const res = await rawFetch("/categories");
      const json = (await res.json()) as { data?: Category[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useCategoryCustomFields(categoryId: string | undefined) {
  return useQuery({
    queryKey: categoryId ? queryKeys.categories.customFields(categoryId) : ["categories", "none"],
    queryFn: async () => {
      const res = await rawFetch(`/categories/${categoryId}/custom-fields`);
      const json = (await res.json()) as { data?: CategoryCustomField[] };
      return json.data ?? [];
    },
    enabled: !!categoryId,
    staleTime: 60_000,
  });
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all(),
    queryFn: async () => {
      const res = await rawFetch("/tags");
      const json = (await res.json()) as { data?: Tag[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string }) => {
      const res = await rawFetch("/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return (await res.json()) as Tag;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tags.all() }),
  });
}

export function useCreateAssetModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await rawFetch("/asset-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as AssetModelDetail;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAssetModel(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await rawFetch(`/asset-models/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as AssetModelDetail;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.assets.detail(id) });
      qc.invalidateQueries({ queryKey: ["assets", "list"] });
    },
  });
}

export function useDeleteAssetModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await rawFetch(`/asset-models/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useCreateUnit(modelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<AssetUnit>) => {
      const res = await rawFetch(`/asset-models/${modelId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as AssetUnit;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assets.detail(modelId) }),
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId, body }: { unitId: string; body: Partial<AssetUnit> }) => {
      const res = await rawFetch(`/asset-units/${unitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as AssetUnit;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (unitId: string) => {
      await rawFetch(`/asset-units/${unitId}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useAttachPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ modelId, fileId }: { modelId: string; fileId: string }) => {
      await rawFetch(`/asset-models/${modelId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: queryKeys.assets.detail(v.modelId) }),
  });
}

export function useTimeline(modelId: string) {
  return useQuery({
    queryKey: queryKeys.assets.timeline(modelId),
    queryFn: async () => {
      const res = await rawFetch(`/assets/${modelId}/timeline`);
      const json = (await res.json()) as { data?: TimelineEvent[] };
      return json.data ?? [];
    },
    enabled: !!modelId,
  });
}

export interface TimelineEvent {
  id: string;
  unitId?: string;
  kind: string;
  message: string;
  at: string;
  actor?: { id: string; name: string };
}

export interface MaintenanceSchedule {
  id: string;
  unitId: string;
  cadenceDays: number;
  nextDueAt: string;
  note?: string;
}

export function useMaintenanceSchedules(modelId: string) {
  return useQuery({
    queryKey: ["maintenance", "model", modelId],
    queryFn: async () => {
      const res = await rawFetch(`/maintenance-schedules?modelId=${modelId}`);
      const json = (await res.json()) as { data?: MaintenanceSchedule[] };
      return json.data ?? [];
    },
    enabled: !!modelId,
  });
}

export function useCreateMaintenanceSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<MaintenanceSchedule>) => {
      const res = await rawFetch("/maintenance-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as MaintenanceSchedule;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }),
  });
}
