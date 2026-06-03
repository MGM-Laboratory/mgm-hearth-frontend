"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAvailability, useRooms } from "@/lib/api/hooks/rooms";
import { jakartaDateKey } from "@/lib/i18n/formats";

/**
 * Slot-based calendar for a single room and a single day.
 * Slots are 30-min cells; backend tells us state (available, booked, buffer, outside_hours).
 */
export function RoomCalendar({ roomId, onSelectRoom }: { roomId?: string; onSelectRoom?: (id: string) => void }) {
  const { data: rooms = [] } = useRooms();
  const [selected, setSelected] = useState<string | undefined>(roomId ?? rooms[0]?.id);
  const [date, setDate] = useState<string>(jakartaDateKey());
  const t = useTranslations();

  const room = selected;
  const { data: availability, isLoading } = useAvailability(room ?? "", date);

  const grouped = useMemo(() => {
    const byHour = new Map<number, Array<typeof availability extends infer A ? (A extends { slots: infer S } ? S extends Array<infer Item> ? Item : never : never) : never>>();
    (availability?.slots ?? []).forEach((slot) => {
      const h = new Date(slot.startAt).getHours();
      const arr = byHour.get(h) ?? [];
      arr.push(slot);
      byHour.set(h, arr);
    });
    return byHour;
  }, [availability]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-caption text-ink-2">Room</label>
          <Select
            value={selected ?? ""}
            onValueChange={(v) => {
              setSelected(v);
              onSelectRoom?.(v);
            }}
          >
            <SelectTrigger className="w-48"><SelectValue placeholder="Select a room" /></SelectTrigger>
            <SelectContent>
              {rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-caption text-ink-2">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="ml-auto flex items-center gap-3 text-caption">
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-brand-green-50 ring-1 ring-brand-green/30" />{t("room.availability.available")}</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-brand-red-50 ring-1 ring-brand-red/30" />{t("room.availability.booked")}</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-brand-yellow-50 ring-1 ring-brand-yellow/40" />{t("room.availability.buffer")}</span>
        </div>
      </div>

      {isLoading || !availability ? (
        <p className="text-body-sm text-ink-3">{t("common.loading")}</p>
      ) : (
        <div className="rounded-DEFAULT border border-line bg-surface p-3">
          <p className="mb-3 text-caption text-ink-3">
            {t("room.openHours", { open: availability.openHour, close: availability.closeHour })}
            {" · "}buffer {availability.bufferMinutes}m
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Array.from(grouped.entries()).map(([h, slots]) => (
              <div key={h} className="rounded-sm border border-line p-2">
                <p className="font-mono text-caption text-ink-3">{h.toString().padStart(2, "0")}:00</p>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {slots.map((s, i) => {
                    const start = new Date(s.startAt);
                    const tone =
                      s.state === "booked"
                        ? "bg-brand-red-50 text-ink ring-1 ring-brand-red/30"
                        : s.state === "buffer"
                        ? "bg-brand-yellow-50 text-ink ring-1 ring-brand-yellow/40"
                        : s.state === "outside_hours"
                        ? "bg-surface-muted text-ink-3"
                        : "bg-brand-green-50 text-ink ring-1 ring-brand-green/30";
                    return (
                      <div key={i} className={`flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[11px] ${tone}`} title={s.ticketNumber ?? s.state}>
                        <span>{start.getMinutes().toString().padStart(2, "0")}</span>
                        {s.ticketNumber ? <Badge variant="outline" className="ml-auto">{s.ticketNumber}</Badge> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
