"use client";

import { useQuery } from "@tanstack/react-query";
import { rawFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export interface Room {
  id: string;
  name: string;
  capacity?: number;
  building?: string;
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  state: "available" | "booked" | "buffer" | "outside_hours";
  ticketNumber?: string;
}

export interface AvailabilityResponse {
  date: string;
  roomId: string;
  openHour: number;
  closeHour: number;
  bufferMinutes: number;
  slots: AvailabilitySlot[];
}

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.room.all(),
    queryFn: async () => {
      const res = await rawFetch("/rooms");
      const json = (await res.json()) as { data?: Room[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAvailability(roomId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.room.availability(roomId, date),
    enabled: !!roomId && !!date,
    queryFn: async () => {
      const res = await rawFetch(`/rooms/${roomId}/availability?date=${date}`);
      return (await res.json()) as AvailabilityResponse;
    },
  });
}
