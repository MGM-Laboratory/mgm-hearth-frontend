import { test, expect } from "@playwright/test";

test.describe("Public QR asset page", () => {
  test("renders public field set only", async ({ page }) => {
    await page.goto("/a/ABCDEFGH1234");
    // Public route is unauthenticated; we render either the page or NotFound.
    // Either way, no Hearth admin UI should be visible.
    await expect(page.locator("text=Admin")).toHaveCount(0);
    await expect(page.locator("text=Internal notes")).toHaveCount(0);
  });

  test("missing publicId shows not-found state", async ({ page }) => {
    await page.goto("/a/MISSING");
    await expect(page.getByText(/404|Not found|No asset/i).first()).toBeVisible();
  });
});
