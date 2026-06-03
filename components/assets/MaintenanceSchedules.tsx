"use client";

import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/shared/Icon";
import { DateTime } from "@/components/shared/DateTime";
import {
  useCreateMaintenanceSchedule,
  useMaintenanceSchedules,
  type AssetUnit,
} from "@/lib/api/hooks/assets";

export function MaintenanceSchedules({ modelId, units }: { modelId: string; units: AssetUnit[] }) {
  const { data: schedules = [] } = useMaintenanceSchedules(modelId);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Icon icon={CalendarClock} size={20} className="text-ink-2" />
          Maintenance schedules
        </CardTitle>
        <ScheduleDialog modelId={modelId} units={units}>
          <Button size="sm" variant="secondary">
            <Icon icon={Plus} size={16} /> Add
          </Button>
        </ScheduleDialog>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-body-sm text-ink-3">No schedules.</p>
        ) : (
          <ul className="divide-y divide-line">
            {schedules.map((s) => {
              const overdue = new Date(s.nextDueAt).getTime() < Date.now();
              return (
                <li key={s.id} className={`flex items-center justify-between py-2 ${overdue ? "text-brand-red" : ""}`}>
                  <div>
                    <p className="text-body-sm text-ink">{s.note ?? "Scheduled maintenance"}</p>
                    <p className="font-mono text-caption text-ink-3">every {s.cadenceDays} days · unit {s.unitId.slice(0, 8)}…</p>
                  </div>
                  <DateTime value={s.nextDueAt} className="font-mono text-caption" />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ScheduleDialog({ modelId: _modelId, units, children }: { modelId: string; units: AssetUnit[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [unitId, setUnitId] = useState<string>(units[0]?.id ?? "");
  const [cadenceDays, setCadence] = useState(90);
  const [nextDueAt, setNextDueAt] = useState<string>("");
  const [note, setNote] = useState("");
  const create = useCreateMaintenanceSchedule();

  function submit() {
    if (!unitId || !nextDueAt) return;
    create.mutate({ unitId, cadenceDays, nextDueAt, note: note || undefined }, { onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add maintenance schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="h-10 w-full rounded-DEFAULT border border-line bg-surface px-3 text-body-sm"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.serialNumber ?? u.publicId}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cad">Cadence (days)</Label>
              <Input id="cad" type="number" value={cadenceDays} onChange={(e) => setCadence(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="due">Next due</Label>
              <Input id="due" type="date" value={nextDueAt} onChange={(e) => setNextDueAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
