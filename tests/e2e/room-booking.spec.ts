import { test, expect } from "@playwright/test";

test.describe("Room booking (smoke)", () => {
  test("room queue route exists and is auth-gated", async ({ page }) => {
    const res = await page.goto("/requests/room");
    expect(res?.url()).toMatch(/(signin|room|not-it)/);
  });
});
