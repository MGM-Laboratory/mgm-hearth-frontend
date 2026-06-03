"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "maintainer" | "member" | "external";
  isActive: boolean;
  locale?: "en" | "id";
  groups?: string[];
  createdAt: string;
}

export interface AdminUsersPage {
  data: AdminUser[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export function useAdminUsers(page = 1, pageSize = 25, q = "", role = "") {
  return useQuery({
    queryKey: queryKeys.admin.users(page, pageSize, q, role),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      const res = await rawFetch(`/admin/users?${params.toString()}`);
      return (await res.json()) as AdminUsersPage;
    },
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<AdminUser> }) => {
      const res = await rawFetch(`/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as AdminUser;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function usePromoteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await rawFetch(`/admin/users/${id}/promote`, { method: "POST" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export interface SystemSettings {
  procurementAdminThresholdIdr?: number;
  borrowMaxItems?: number;
  roomOpenHour?: number;
  roomCloseHour?: number;
  roomMinAdvanceHours?: number;
  roomMaxAdvanceDays?: number;
  roomBufferMinutes?: number;
  roomMaxDurationMinutes?: number;
  licenseDefaultMonths?: number;
  licenseMaxMonths?: number;
  infraWarnVcpu?: number;
  infraWarnRamGb?: number;
  infraWarnStorageGb?: number;
  defaultLocale?: "en" | "id";
}

export function useSystemSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: async () => {
      const res = await rawFetch("/admin/settings");
      return (await res.json()) as SystemSettings;
    },
  });
}

export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SystemSettings) => {
      const res = await rawFetch("/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await res.json()) as SystemSettings;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.settings() }),
  });
}
