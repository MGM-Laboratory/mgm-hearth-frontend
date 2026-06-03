"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useBearerSync } from "@/lib/auth/session";
import { useSseInvalidation } from "@/lib/sse/client";

export function AppShell({ children }: { children: ReactNode }) {
  useBearerSync();
  useSseInvalidation();
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
