"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setBearerToken } from "@/lib/api/client";

/**
 * Hook used at the top of (app)/layout to forward the access token into the
 * shared API client. Without this every browser-side fetch would be unauthenticated.
 */
export function useBearerSync() {
  const { data } = useSession();
  const token = data?.accessToken;
  useEffect(() => {
    setBearerToken(token);
  }, [token]);
  return token;
}
