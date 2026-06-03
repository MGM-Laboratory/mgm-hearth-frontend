/**
 * Centralized TanStack Query keys. The SSE invalidation map in lib/sse/invalidate.ts
 * references these — never inline new query keys at call sites.
 */

export const queryKeys = {
  me: ["me"] as const,

  assets: {
    list: (filters: Record<string, unknown> = {}) => ["assets", "list", filters] as const,
    detail: (modelId: string) => ["assets", "detail", modelId] as const,
    unit: (unitId: string) => ["assets", "unit", unitId] as const,
    timeline: (modelId: string) => ["assets", "timeline", modelId] as const,
  },

  categories: {
    all: () => ["categories"] as const,
    customFields: (categoryId: string) => ["categories", categoryId, "custom-fields"] as const,
  },

  tags: {
    all: () => ["tags"] as const,
  },

  cart: () => ["cart"] as const,

  borrow: {
    list: (scope: "mine" | "all" = "all", status?: string) => ["borrow", "list", scope, status ?? null] as const,
    detail: (id: string) => ["borrow", "detail", id] as const,
  },

  procurement: {
    list: (scope: "mine" | "all" = "all", status?: string) => ["procurement", "list", scope, status ?? null] as const,
    detail: (id: string) => ["procurement", "detail", id] as const,
  },

  infra: {
    list: (scope: "mine" | "all" = "all", status?: string) => ["infra", "list", scope, status ?? null] as const,
    detail: (id: string) => ["infra", "detail", id] as const,
    catalog: () => ["infra-catalog"] as const,
  },

  room: {
    all: () => ["rooms"] as const,
    availability: (roomId: string, date: string) => ["rooms", roomId, "availability", date] as const,
    bookings: (scope: "mine" | "all" = "all", status?: string, roomId?: string) =>
      ["room-bookings", "list", scope, status ?? null, roomId ?? null] as const,
    bookingDetail: (id: string) => ["room-bookings", "detail", id] as const,
  },

  license: {
    list: (scope: "mine" | "all" = "all", status?: string, kind?: string) =>
      ["license", "list", scope, status ?? null, kind ?? null] as const,
    detail: (id: string) => ["license", "detail", id] as const,
    catalog: (kind?: string) => ["license-catalog", kind ?? null] as const,
  },

  general: {
    list: (scope: "mine" | "all" = "all", status?: string) => ["general", "list", scope, status ?? null] as const,
    detail: (id: string) => ["general", "detail", id] as const,
  },

  notifications: {
    list: (unreadOnly = false) => ["notifications", "list", unreadOnly] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },

  maintenance: {
    upcoming: (dueWithinDays = 30) => ["maintenance", "upcoming", dueWithinDays] as const,
  },

  stickerTemplates: () => ["sticker-templates"] as const,

  admin: {
    users: (page = 1, pageSize = 25, q = "", role = "") =>
      ["admin", "users", page, pageSize, q, role] as const,
    settings: () => ["admin", "settings"] as const,
    stats: (rangeDays = 30) => ["admin", "stats", rangeDays] as const,
  },

  publicAsset: (publicId: string) => ["public", "asset", publicId] as const,
} as const;
