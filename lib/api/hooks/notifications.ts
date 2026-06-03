"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export interface NotificationListItem {
  id: string;
  titleI18nKey: string;
  params?: Record<string, string | number>;
  link?: string;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsPage {
  data: NotificationListItem[];
  pagination: { nextCursor?: string | null; hasMore?: boolean };
}

export function useNotifications(unreadOnly = false) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(unreadOnly),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.pagination?.nextCursor ?? undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (unreadOnly) params.set("unreadOnly", "true");
      params.set("limit", "20");
      if (pageParam) params.set("cursor", pageParam);
      const res = await rawFetch(`/notifications?${params.toString()}`);
      return (await res.json()) as NotificationsPage;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await rawFetch(`/notifications/${id}/read`, { method: "PATCH" });
    },
    onMutate: async (id) => {
      // Optimistic: stamp readAt locally.
      await qc.cancelQueries({ queryKey: ["notifications"] });
      const snapshot = qc.getQueriesData({ queryKey: ["notifications"] });
      qc.setQueriesData<{ pages?: NotificationsPage[] } | undefined>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              data: p.data.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
            })),
          };
        },
      );
      return { snapshot };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot) for (const [k, v] of ctx.snapshot) qc.setQueryData(k, v);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await rawFetch("/notifications/read-all", { method: "POST" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
