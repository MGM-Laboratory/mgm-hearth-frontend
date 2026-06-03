"use client";

import { useQuery } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface PendingCount {
  borrow: number;
  procurement: number;
  infra: number;
  room: number;
  license: number;
  general: number;
}

interface OverdueItem {
  id: string;
  ticketNumber: string;
  requesterName?: string;
  daysOverdue: number;
}

interface MaintenanceDueItem {
  id: string;
  unitId: string;
  assetName: string;
  dueAt: string;
}

async function fetchPending(): Promise<PendingCount> {
  // Pull a small page of pending records per type. Backend's stats endpoint
  // returns approval queues; failing that, infer from queue list counts.
  async function count(path: string): Promise<number> {
    try {
      const res = await rawFetch(`${path}?status=submitted&limit=1`);
      const json = (await res.json()) as { pagination?: { total?: number; nextCursor?: string | null }; data?: unknown[] };
      return json.pagination?.total ?? (json.data?.length ?? 0);
    } catch {
      return 0;
    }
  }
  const [borrow, procurement, infra, room, license, general] = await Promise.all([
    count("/borrow-requests"),
    count("/procurement-requests"),
    count("/infra-requests"),
    count("/room-bookings"),
    count("/license-requests"),
    count("/general-requests"),
  ]);
  return { borrow, procurement, infra, room, license, general };
}

export function usePendingCounts() {
  return useQuery({
    queryKey: ["dashboard", "pending"],
    queryFn: fetchPending,
    staleTime: 15_000,
  });
}

export function useOverdueBorrows() {
  return useQuery({
    queryKey: ["dashboard", "overdue-borrows"],
    queryFn: async (): Promise<OverdueItem[]> => {
      try {
        const res = await rawFetch("/borrow-requests?status=overdue&limit=5");
        const json = (await res.json()) as { data?: OverdueItem[] };
        return json.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
  });
}

export function useUpcomingMaintenance() {
  return useQuery({
    queryKey: queryKeys.maintenance.upcoming(14),
    queryFn: async (): Promise<MaintenanceDueItem[]> => {
      try {
        const res = await rawFetch("/maintenance-schedules?dueWithinDays=14");
        const json = (await res.json()) as { data?: MaintenanceDueItem[] };
        return json.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}

export interface AdminStats {
  mostBorrowedModels?: Array<{ modelId: string; modelName: string; borrowCount: number }>;
  utilizationByCategory?: Array<{ category: string; utilization: number }>;
  overdueRatePct?: number;
  totalActiveBorrows?: number;
  totalAssetUnits?: number;
  rangeDays?: number;
}

export function useAdminStats(rangeDays = 30) {
  return useQuery({
    queryKey: queryKeys.admin.stats(rangeDays),
    queryFn: async (): Promise<AdminStats> => {
      const res = await rawFetch(`/admin/stats?rangeDays=${rangeDays}`);
      return (await res.json()) as AdminStats;
    },
    staleTime: 60_000,
  });
}
