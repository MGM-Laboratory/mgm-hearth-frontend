"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ImportResult } from "@/lib/api/hooks/import";
import { Badge } from "@/components/ui/badge";

export function ImportResultTable({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {result.dryRun ? <Badge variant="yellow">Dry run</Badge> : <Badge variant="green">Imported</Badge>}
        <Badge variant="outline">{result.modelsCreated} models</Badge>
        <Badge variant="outline">{result.unitsCreated} units</Badge>
        {result.errors.length > 0 ? <Badge variant="red">{result.errors.length} errors</Badge> : null}
      </div>
      {result.errors.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Row</TableHead>
              <TableHead className="w-40">Field</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.errors.map((e, i) => (
              <TableRow key={`${e.row}-${i}`}>
                <TableCell className="font-mono">{e.row}</TableCell>
                <TableCell className="font-mono text-caption text-ink-3">{e.field ?? "—"}</TableCell>
                <TableCell className="text-brand-red">{e.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
}
