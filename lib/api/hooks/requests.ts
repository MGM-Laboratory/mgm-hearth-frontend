"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export type RequestKind = "borrow" | "procurement" | "infra" | "room" | "license" | "general";
export type RequestStatusGroup = "pending" | "in_progress" | "closed";

const PATHS: Record<RequestKind, string> = {
  borrow: "/borrow-requests",
  procurement: "/procurement-requests",
  infra: "/infra-requests",
  room: "/room-bookings",
  license: "/license-requests",
  general: "/general-requests",
};

const KEY_NS: Record<RequestKind, string> = {
  borrow: "borrow",
  procurement: "procurement",
  infra: "infra",
  room: "room-bookings",
  license: "license",
  general: "general",
};

export const PENDING_STATUSES: Record<RequestKind, string[]> = {
  borrow: ["submitted"],
  procurement: ["submitted", "in_review"],
  infra: ["submitted", "in_review"],
  room: ["pending"],
  license: ["submitted", "in_review"],
  general: ["submitted", "in_review"],
};

export const IN_PROGRESS_STATUSES: Record<RequestKind, string[]> = {
  borrow: ["approved", "ready_for_pickup", "borrowed", "overdue"],
  procurement: ["approved", "ordered", "received"],
  infra: ["approved", "provisioned"],
  room: ["approved"],
  license: ["approved", "assigned"],
  general: ["approved"],
};

export const CLOSED_STATUSES: Record<RequestKind, string[]> = {
  borrow: ["returned", "rejected", "cancelled", "closed"],
  procurement: ["closed", "rejected"],
  infra: ["closed", "rejected"],
  room: ["rejected", "cancelled"],
  license: ["closed", "rejected"],
  general: ["closed", "rejected"],
};

export interface RequestSummary {
  id: string;
  ticketNumber: string;
  status: string;
  requester?: { id?: string; name?: string; email?: string };
  createdAt: string;
  updatedAt?: string;
  needsAdminApproval?: boolean;
  daysOverdue?: number;
}

export interface RequestPage {
  data: RequestSummary[];
  pagination: { nextCursor?: string | null; hasMore?: boolean };
}

export function useRequestList(kind: RequestKind, statuses: string[]) {
  return useInfiniteQuery({
    queryKey: [KEY_NS[kind], "list", "all", statuses.join(",")],
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.pagination?.nextCursor ?? undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("scope", "all");
      params.set("limit", "25");
      for (const s of statuses) params.append("status", s);
      if (pageParam) params.set("cursor", pageParam);
      const res = await rawFetch(`${PATHS[kind]}?${params.toString()}`);
      return (await res.json()) as RequestPage;
    },
  });
}

export function useRequestDetail<T = unknown>(kind: RequestKind, id: string | undefined) {
  return useQuery({
    queryKey: [KEY_NS[kind], "detail", id],
    queryFn: async () => {
      const res = await rawFetch(`${PATHS[kind]}/${id}`);
      return (await res.json()) as T;
    },
    enabled: !!id,
  });
}

export function useRequestDecision(kind: RequestKind, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { decision: "approved" | "rejected"; comment?: string }) => {
      const res = await rawFetch(`${PATHS[kind]}/${id}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as unknown;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY_NS[kind]] });
    },
  });
}

export function useGenericLifecycle(kind: RequestKind, id: string, action: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown> = {}) => {
      const res = await rawFetch(`${PATHS[kind]}/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as unknown;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY_NS[kind]] });
    },
  });
}
