"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchEventSource, type EventSourceMessage } from "@microsoft/fetch-event-source";
import { getBearerToken } from "@/lib/api/client";
import { invalidateForEvent } from "./invalidate";
import type { SseEventName, SseEventPayload } from "./events";

const SSE_EVENTS: SseEventName[] = [
  "request.created",
  "request.status_changed",
  "borrow.ready_for_pickup",
  "borrow.picked_up",
  "borrow.returned",
  "borrow.overdue",
  "room.booking_created",
  "room.booking_decided",
  "maintenance.due",
  "procurement.lifecycle_changed",
  "notification.new",
];

const SSE_PATH = "/realtime";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
}

/**
 * Subscribe to the realtime SSE stream and invalidate query caches on each event.
 * Mount once near the top of the (app) layout.
 */
export function useSseInvalidation() {
  const qc = useQueryClient();
  const lastEventIdRef = useRef<string | undefined>(undefined);
  const ctrlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const token = getBearerToken();
    if (!token) return; // wait until token is set

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    void fetchEventSource(`${apiBase()}${SSE_PATH}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(lastEventIdRef.current ? { "Last-Event-ID": lastEventIdRef.current } : {}),
      },
      signal: ctrl.signal,
      openWhenHidden: false,
      onmessage(ev: EventSourceMessage) {
        if (ev.id) lastEventIdRef.current = ev.id;
        const name = ev.event as SseEventName;
        if (!SSE_EVENTS.includes(name)) return;
        let payload: SseEventPayload = {};
        try {
          payload = ev.data ? (JSON.parse(ev.data) as SseEventPayload) : {};
        } catch {
          // ignore malformed payload — invalidation still safe to run with empty payload
        }
        invalidateForEvent(qc, name, payload);
      },
      onerror(err) {
        // Returning a number tells fetch-event-source to retry after that many ms.
        // Exponential-ish backoff: 1s → 30s.
        return Math.min(30_000, 1000 + Math.random() * 2000);
      },
    });

    return () => {
      ctrl.abort();
    };
    // We intentionally only re-run when the bearer token presence flips; token rotation
    // doesn't require reconnecting because Auth.js refreshes silently and getBearerToken()
    // returns the latest value on next reconnect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc]);
}
