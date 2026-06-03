"use client";

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: unknown) => {
          // Don't retry auth/permission errors — handled by error funnel.
          const code = (error as { code?: string } | undefined)?.code;
          if (code === "UNAUTHENTICATED" || code === "FORBIDDEN" || code === "NOT_IT_MEMBER") return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
