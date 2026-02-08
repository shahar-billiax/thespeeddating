import { test, expect } from "@playwright/test";

test.describe("Public layout", () => {
  test("renders header with navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("header").getByText("The Speed Dating")).toBeVisible();
  });

  test("renders footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("shows login and register links when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
  });
});

test.describe("Auth layout", () => {
  test("renders centered card on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
  });

  test("renders centered card on register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Create Account")).toBeVisible();
  });
});

test.describe("Admin layout", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });
});
