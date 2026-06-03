"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSystemSettings, useUpdateSystemSettings, type SystemSettings } from "@/lib/api/hooks/admin";

export function SettingsForm() {
  const { data } = useSystemSettings();
  const update = useUpdateSystemSettings();
  const [form, setForm] = useState<SystemSettings>({});
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set<K extends keyof SystemSettings>(k: K, v: SystemSettings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function num(k: keyof SystemSettings) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = e.target.value === "" ? undefined : Number(e.target.value);
      setForm((f) => ({ ...f, [k]: n }));
    };
  }

  function submit() {
    update.mutate(form, {
      onSuccess: () => toast.success("Saved"),
      onError: () => toast.error("Failed to save"),
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Procurement</CardTitle></CardHeader>
        <CardContent>
          <Field label="Admin approval threshold (IDR)" hint="Requests ≥ this require Admin approval.">
            <Input type="number" value={form.procurementAdminThresholdIdr ?? ""} onChange={num("procurementAdminThresholdIdr")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Borrow</CardTitle></CardHeader>
        <CardContent>
          <Field label="Max items per active borrow">
            <Input type="number" value={form.borrowMaxItems ?? ""} onChange={num("borrowMaxItems")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Room booking</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Field label="Open hour (Jakarta)"><Input type="number" value={form.roomOpenHour ?? ""} onChange={num("roomOpenHour")} /></Field>
          <Field label="Close hour (Jakarta)"><Input type="number" value={form.roomCloseHour ?? ""} onChange={num("roomCloseHour")} /></Field>
          <Field label="Min advance (hours)"><Input type="number" value={form.roomMinAdvanceHours ?? ""} onChange={num("roomMinAdvanceHours")} /></Field>
          <Field label="Max advance (days)"><Input type="number" value={form.roomMaxAdvanceDays ?? ""} onChange={num("roomMaxAdvanceDays")} /></Field>
          <Field label="Buffer (minutes)"><Input type="number" value={form.roomBufferMinutes ?? ""} onChange={num("roomBufferMinutes")} /></Field>
          <Field label="Max duration (minutes)"><Input type="number" value={form.roomMaxDurationMinutes ?? ""} onChange={num("roomMaxDurationMinutes")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>License</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Field label="Default months"><Input type="number" value={form.licenseDefaultMonths ?? ""} onChange={num("licenseDefaultMonths")} /></Field>
          <Field label="Max months"><Input type="number" value={form.licenseMaxMonths ?? ""} onChange={num("licenseMaxMonths")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Infra spec warnings</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Field label="vCPU"><Input type="number" value={form.infraWarnVcpu ?? ""} onChange={num("infraWarnVcpu")} /></Field>
          <Field label="RAM (GB)"><Input type="number" value={form.infraWarnRamGb ?? ""} onChange={num("infraWarnRamGb")} /></Field>
          <Field label="Storage (GB)"><Input type="number" value={form.infraWarnStorageGb ?? ""} onChange={num("infraWarnStorageGb")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Locale</CardTitle></CardHeader>
        <CardContent>
          <Field label="Default locale">
            <Select value={form.defaultLocale ?? "en"} onValueChange={(v) => set("defaultLocale", v as "en" | "id")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={update.isPending}>Save settings</Button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-caption text-ink-3">{hint}</p> : null}
    </div>
  );
}
