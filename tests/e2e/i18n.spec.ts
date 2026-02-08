import { test, expect } from "@playwright/test";

test.describe("i18n", () => {
  test("default locale is English (LTR)", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");
  });

  test("country switcher is visible", async ({ page }) => {
    await page.goto("/");
    // Country switcher button should show the globe icon
    const switcher = page.getByRole("button", { name: /uk/i });
    await expect(switcher).toBeVisible();
  });

  test("switching to Israel sets RTL", async ({ page }) => {
    // Set the country cookie to IL and reload
    await page.goto("/");
    await page.context().addCookies([
      { name: "country", value: "il", url: "http://localhost:3000" },
    ]);
    await page.reload();

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "he");
    await expect(html).toHaveAttribute("dir", "rtl");
  });
});
