"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryCustomField } from "@/lib/api/hooks/assets";

interface Props {
  fields: CategoryCustomField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

export function CustomFieldsForm({ fields, values, onChange }: Props) {
  if (fields.length === 0) {
    return <p className="text-body-sm text-ink-3">No custom fields for this category.</p>;
  }

  function set(key: string, v: unknown) {
    onChange({ ...values, [key]: v });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((f) => {
        const id = `cf-${f.key}`;
        const v = values[f.key];
        return (
          <div key={f.id} className="flex flex-col gap-1">
            <Label htmlFor={id}>
              {f.label}
              {f.required ? <span className="ml-1 text-brand-red">*</span> : null}
            </Label>
            {f.type === "text" || f.type === "date" ? (
              <Input
                id={id}
                type={f.type === "date" ? "date" : "text"}
                value={(v as string) ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : f.type === "number" ? (
              <Input
                id={id}
                type="number"
                value={(v as number) ?? ""}
                onChange={(e) => set(f.key, e.target.value ? Number(e.target.value) : undefined)}
              />
            ) : f.type === "boolean" ? (
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id={id}
                  checked={Boolean(v)}
                  onCheckedChange={(c) => set(f.key, c === true)}
                />
                <span className="text-body-sm text-ink-2">{f.helpText ?? ""}</span>
              </div>
            ) : f.type === "select" ? (
              <Select value={(v as string) ?? ""} onValueChange={(val) => set(f.key, val)}>
                <SelectTrigger id={id}>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {(f.options ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {f.helpText && f.type !== "boolean" ? (
              <span className="text-caption text-ink-3">{f.helpText}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
