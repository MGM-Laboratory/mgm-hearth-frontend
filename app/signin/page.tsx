"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

/**
 * Custom sign-in entry. Hearth has a single identity provider (Keycloak), so
 * there is no provider-picker to show — we immediately kick off the OIDC flow
 * and the browser is redirected to Keycloak. A brief spinner is shown while the
 * `signIn()` round-trip (CSRF mint → 302 to Keycloak) is in flight, so the user
 * always sees that something is happening.
 *
 * This page is referenced by `pages.signIn` and by the middleware redirect; it
 * must stay out of the auth gate (see PUBLIC_PATHS in middleware.ts).
 */
function Redirector() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  useEffect(() => {
    void signIn("keycloak", { callbackUrl });
  }, [callbackUrl]);

  return null;
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Suspense fallback={null}>
        <Redirector />
      </Suspense>
      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
      <p className="text-body-lg text-ink" role="status" aria-live="polite">
        Redirecting to sign-in…
      </p>
      <p className="text-body-sm text-ink-3">Taking you to Keycloak to continue.</p>
    </main>
  );
}
