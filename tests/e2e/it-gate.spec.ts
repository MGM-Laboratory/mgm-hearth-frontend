import { test, expect } from "@playwright/test";

test.describe("IT-gate", () => {
  test("/not-it renders the gate screen with no app nav", async ({ page }) => {
    await page.goto("/not-it");
    await expect(page.getByText("IT & Maintenance only").first()).toBeVisible();
    // The Hearth sidebar should NOT be rendered on this route.
    await expect(page.locator("aside nav")).toHaveCount(0);
  });
});
