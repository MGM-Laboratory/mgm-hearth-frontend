/**
 * SSE event enum — exact names per CONVENTIONS.md §Realtime.
 * The backend emits these to all role-scoped subscribers of GET /realtime.
 */

export type SseEventName =
  | "request.created"
  | "request.status_changed"
  | "borrow.ready_for_pickup"
  | "borrow.picked_up"
  | "borrow.returned"
  | "borrow.overdue"
  | "room.booking_created"
  | "room.booking_decided"
  | "maintenance.due"
  | "procurement.lifecycle_changed"
  | "notification.new";

export type SseEntity = "borrow" | "procurement" | "infra" | "room" | "license" | "general" | "asset";

export interface SseEventPayload {
  entity?: SseEntity;
  ticketNumber?: string;
  requester?: { id?: string; name?: string };
  from?: string;
  to?: string;
  decidedBy?: { id?: string; name?: string };
  pickupDate?: string;
  pickedUpAt?: string;
  returnedAt?: string;
  damageReported?: boolean;
  daysOverdue?: number;
  roomId?: string;
  startAt?: string;
  endAt?: string;
  decision?: "approved" | "rejected";
  unitId?: string;
  dueAt?: string;
  notificationId?: string;
  title?: string;
  link?: string;
}
