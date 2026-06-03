import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { invalidateForEvent } from "@/lib/sse/invalidate";

function makeClient() {
  const qc = new QueryClient();
  const spy = vi.spyOn(qc, "invalidateQueries");
  return { qc, spy };
}

describe("invalidateForEvent", () => {
  it("invalidates borrow on request.status_changed with entity=borrow", () => {
    const { qc, spy } = makeClient();
    invalidateForEvent(qc, "request.status_changed", { entity: "borrow", ticketNumber: "BRW-1" });
    const called = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown[] }).queryKey[0]);
    expect(called).toContain("borrow");
    expect(called).toContain("notifications");
  });

  it("invalidates room availability on room.booking_decided", () => {
    const { qc, spy } = makeClient();
    invalidateForEvent(qc, "room.booking_decided", { roomId: "r1" });
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown[] }).queryKey);
    expect(keys.some((k) => k[0] === "room-bookings")).toBe(true);
    expect(keys.some((k) => k[0] === "rooms" && k[1] === "r1")).toBe(true);
  });

  it("invalidates notifications on notification.new", () => {
    const { qc, spy } = makeClient();
    invalidateForEvent(qc, "notification.new", { notificationId: "n1" });
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown[] }).queryKey[0]);
    expect(keys).toContain("notifications");
  });

  it("invalidates assets + maintenance on maintenance.due", () => {
    const { qc, spy } = makeClient();
    invalidateForEvent(qc, "maintenance.due", { unitId: "u1" });
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown[] }).queryKey[0]);
    expect(keys).toContain("maintenance");
    expect(keys).toContain("assets");
  });
});
