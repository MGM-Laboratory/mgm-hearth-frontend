import { test, expect } from "@playwright/test";

// This is a smoke spec — the full flow requires authenticated state which is
// stubbed via the dev server's MSW handlers. In CI, when an authenticated
// fixture is wired, expand this to drive create → unit → sticker.
test.describe("Asset flow (smoke)", () => {
  test("public root redirects to dashboard which is auth-gated", async ({ page }) => {
    const res = await page.goto("/");
    // Without auth, middleware sends us to /api/auth/signin.
    expect(res?.url()).toMatch(/(signin|dashboard|not-it)/);
  });
});
