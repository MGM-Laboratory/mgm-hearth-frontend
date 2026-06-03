"use client";

import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import type { AppRole } from "./config";

export function useRole(): AppRole | undefined {
  const { data } = useSession();
  return data?.role;
}

export function useIsAdmin(): boolean {
  return useRole() === "admin";
}

export function useIsMaintainerOrAdmin(): boolean {
  const r = useRole();
  return r === "admin" || r === "maintainer";
}

interface RoleGateProps {
  /** Allowed roles. Defaults to `["admin", "maintainer"]` (the Hearth audience). */
  allow?: AppRole[];
  /** Render this when the current role is not in `allow`. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Client-side role gate. Pairs with server-side checks — never the sole barrier.
 * Server enforces the same rules via 403 NOT_IT_MEMBER / FORBIDDEN.
 */
export function RoleGate({ allow = ["admin", "maintainer"], fallback = null, children }: RoleGateProps) {
  const role = useRole();
  if (!role) return null;
  if (!allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}

/** Admin-only convenience wrapper. */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGate allow={["admin"]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
