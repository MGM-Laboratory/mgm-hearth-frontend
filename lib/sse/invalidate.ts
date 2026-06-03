import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { SseEventName, SseEventPayload } from "./events";

/**
 * Map every SSE event to the TanStack Query keys it should invalidate.
 * Pure function — exported for unit testing.
 */
export function invalidateForEvent(
  qc: QueryClient,
  event: SseEventName,
  payload: SseEventPayload,
): void {
  switch (event) {
    case "request.created":
    case "request.status_changed": {
      const entity = payload.entity;
      if (entity === "borrow") qc.invalidateQueries({ queryKey: ["borrow"] });
      else if (entity === "procurement") qc.invalidateQueries({ queryKey: ["procurement"] });
      else if (entity === "infra") qc.invalidateQueries({ queryKey: ["infra"] });
      else if (entity === "room") qc.invalidateQueries({ queryKey: ["room-bookings"] });
      else if (entity === "license") qc.invalidateQueries({ queryKey: ["license"] });
      else if (entity === "general") qc.invalidateQueries({ queryKey: ["general"] });
      else if (entity === "asset") qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      return;
    }
    case "borrow.ready_for_pickup":
    case "borrow.picked_up":
    case "borrow.returned":
    case "borrow.overdue":
      qc.invalidateQueries({ queryKey: ["borrow"] });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      return;
    case "room.booking_created":
    case "room.booking_decided":
      qc.invalidateQueries({ queryKey: ["room-bookings"] });
      if (payload.roomId) {
        qc.invalidateQueries({ queryKey: ["rooms", payload.roomId, "availability"] });
      }
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      return;
    case "procurement.lifecycle_changed":
      qc.invalidateQueries({ queryKey: ["procurement"] });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      return;
    case "maintenance.due":
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      return;
    case "notification.new":
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list(true) });
      return;
  }
}
