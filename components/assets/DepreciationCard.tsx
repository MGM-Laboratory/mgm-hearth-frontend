"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money } from "@/components/shared/Money";
import type { AssetUnit } from "@/lib/api/hooks/assets";

/**
 * Compute current value client-side based on the purchase fields. The backend stores
 * raw inputs; this is a presentation calculation per CONVENTIONS.
 */
function computeCurrentValue(purchase?: AssetUnit["purchase"]): number | undefined {
  if (!purchase?.price || !purchase.date || !purchase.usefulLifeMonths) return purchase?.price;
  const months = Math.max(0, monthsBetween(new Date(purchase.date), new Date()));
  const salvage = purchase.salvageValue ?? 0;
  const depreciable = Math.max(0, purchase.price - salvage);

  if (purchase.depreciationMethod === "none") return purchase.price;
  if (purchase.depreciationMethod === "declining_balance") {
    // 2x straight-line rate
    const rate = (2 / purchase.usefulLifeMonths);
    const v = Math.max(salvage, purchase.price * Math.pow(1 - rate, months));
    return Math.round(v);
  }
  // Default: straight-line.
  const monthly = depreciable / purchase.usefulLifeMonths;
  const v = Math.max(salvage, purchase.price - monthly * months);
  return Math.round(v);
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

export function DepreciationCard({ unit }: { unit: AssetUnit }) {
  const current = computeCurrentValue(unit.purchase);
  if (!unit.purchase?.price) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Depreciation</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Purchase price"><Money amount={unit.purchase.price} /></Field>
        {unit.purchase.date ? <Field label="Purchase date">{new Date(unit.purchase.date).toLocaleDateString()}</Field> : null}
        {unit.purchase.usefulLifeMonths ? <Field label="Useful life">{unit.purchase.usefulLifeMonths} months</Field> : null}
        {unit.purchase.salvageValue ? <Field label="Salvage value"><Money amount={unit.purchase.salvageValue} /></Field> : null}
        {unit.purchase.depreciationMethod ? <Field label="Method">{unit.purchase.depreciationMethod}</Field> : null}
        {current !== undefined ? (
          <Field label="Current value">
            <span className="font-display text-h3 text-ink"><Money amount={current} /></span>
          </Field>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption text-ink-3">{label}</p>
      <p className="text-body-sm text-ink">{children}</p>
    </div>
  );
}
