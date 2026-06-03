"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminUsers, usePromoteAdmin, useUpdateAdminUser } from "@/lib/api/hooks/admin";

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const { data, isLoading } = useAdminUsers(page, 25, q);
  const update = useUpdateAdminUser();
  const promote = usePromoteAdmin();

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search by name or email…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />
      {isLoading || !data ? (
        <p className="text-body-sm text-ink-3">Loading…</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-caption">{u.email}</TableCell>
                  <TableCell>{u.name ?? "—"}</TableCell>
                  <TableCell><Badge variant={u.role === "admin" ? "yellow" : "default"}>{u.role}</Badge></TableCell>
                  <TableCell>{u.isActive ? <Badge variant="green">Active</Badge> : <Badge variant="outline">Inactive</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {u.role !== "admin" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!confirm(`Promote ${u.email} to admin?`)) return;
                          promote.mutate(u.id, { onSuccess: () => toast.success("Promoted") });
                        }}
                      >
                        Promote
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => update.mutate({ id: u.id, body: { isActive: !u.isActive } })}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between">
            <p className="text-caption text-ink-3">
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} users
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
