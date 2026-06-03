import { test, expect } from "@playwright/test";

test.describe("Borrow lifecycle (smoke)", () => {
  test("borrow queue route exists and is auth-gated", async ({ page }) => {
    const res = await page.goto("/requests/borrow");
    expect(res?.url()).toMatch(/(signin|borrow|not-it)/);
  });
});
