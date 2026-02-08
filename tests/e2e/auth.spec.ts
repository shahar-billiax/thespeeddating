import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page has email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("register page has multi-step form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Step 1 of 2")).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
  });

  test("reset password page has email field", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("[data-slot='card-title']")).toContainText("Reset Password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("admin route redirects unauthenticated user", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("redirect=%2Fadmin");
  });
});
