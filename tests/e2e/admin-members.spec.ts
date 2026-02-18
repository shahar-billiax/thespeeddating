import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1440, height: 900 },
  trace: "on",
  video: "off",
});

test.setTimeout(120_000);

test("Admin Members — full filter walkthrough", async ({ page }) => {
  const wait = () => page.waitForTimeout(400);

  // Filter panel — the aside that contains "Name, email, phone..." search input
  const fp = () => page.locator("aside").filter({ has: page.getByPlaceholder("Name, email, phone...") });

  // ────────────────────────────────────────────────
  // 1. LOGIN
  // ────────────────────────────────────────────────
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("admin@thespeeddating.co.uk");
  await page.getByLabel(/password/i).fill("admin123456");
  await page.getByRole("button", { name: /sign in|log in|login/i }).click();
  await page.waitForURL("**/dashboard**");

  // ────────────────────────────────────────────────
  // 2. NAVIGATE to members
  // ────────────────────────────────────────────────
  await page.goto("/admin/members");
  await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();

  // ────────────────────────────────────────────────
  // 3. SWITCH country to GB via header
  // ────────────────────────────────────────────────
  const headerCountryBtn = page.locator("header button").filter({ hasText: /Israel|United Kingdom/i }).first();
  await headerCountryBtn.click();
  await page.getByText("United Kingdom").click();
  await wait();

  await expect(page.locator("table")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toBeVisible();
  const initialCount = await page.locator("table tbody tr").count();
  expect(initialCount).toBeGreaterThanOrEqual(1);

  // Verify filter panel exists
  await expect(fp()).toBeVisible();

  // ────────────────────────────────────────────────
  // 4. SEARCH — by name and email
  // ────────────────────────────────────────────────
  const searchInput = fp().getByPlaceholder("Name, email, phone...");
  await searchInput.fill("Admin");
  await wait();
  await expect(page.locator("table tbody")).toContainText("Admin");
  await searchInput.clear();
  await wait();

  await searchInput.fill("test-daniel");
  await wait();
  await expect(page.locator("table tbody")).toContainText("Daniel");
  await searchInput.clear();
  await wait();

  // ────────────────────────────────────────────────
  // 5. GENDER — Male / Female / All
  // ────────────────────────────────────────────────
  await fp().getByRole("button", { name: "Male", exact: true }).click();
  await wait();
  await expect(page.locator("text=Gender: male")).toBeVisible();

  await fp().getByRole("button", { name: "Female", exact: true }).click();
  await wait();
  await expect(page.locator("text=Gender: female")).toBeVisible();

  await fp().locator("button:text-is('All')").first().click();
  await wait();

  // ────────────────────────────────────────────────
  // 6. COUNTRY — All Countries, then back to GB
  // ────────────────────────────────────────────────
  await fp().getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "All Countries" }).click();
  await wait();
  const allCount = await page.locator("table tbody tr").count();
  expect(allCount).toBeGreaterThanOrEqual(initialCount);

  await fp().getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "United Kingdom" }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 7. ROLE — Admin, then All Roles
  // ────────────────────────────────────────────────
  await fp().getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Admin" }).click();
  await wait();
  await expect(page.locator("text=Role: admin")).toBeVisible();

  await fp().getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "All Roles" }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 8. STATUS — Active / Inactive / All
  // ────────────────────────────────────────────────
  await fp().getByRole("button", { name: "Active", exact: true }).click();
  await wait();
  await fp().getByRole("button", { name: "Inactive", exact: true }).click();
  await wait();
  await fp().locator("button:text-is('All')").nth(1).click();
  await wait();

  // ────────────────────────────────────────────────
  // 9. VIP — VIP / Non-VIP / All
  // ────────────────────────────────────────────────
  await fp().getByRole("button", { name: "VIP", exact: true }).click();
  await wait();
  await expect(page.locator("text=VIP: Yes")).toBeVisible();

  await fp().getByRole("button", { name: "Non-VIP", exact: true }).click();
  await wait();
  await expect(page.locator("text=VIP: No")).toBeVisible();

  await fp().locator("button:text-is('All')").nth(2).click();
  await wait();

  // ────────────────────────────────────────────────
  // 10. RELATIONSHIP STATUS — Single, then All
  // ────────────────────────────────────────────────
  const combo2 = fp().getByRole("combobox").nth(2);
  await combo2.scrollIntoViewIfNeeded();
  await combo2.click();
  await page.getByRole("option", { name: "Single" }).click();
  await wait();
  await expect(page.locator("text=Relationship: single")).toBeVisible();
  await combo2.click();
  await page.getByRole("option", { name: /^All$/ }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 11. RELIGIOUS LEVEL — Secular, then All
  // ────────────────────────────────────────────────
  const combo3 = fp().getByRole("combobox").nth(3);
  await combo3.scrollIntoViewIfNeeded();
  await combo3.click();
  await page.getByRole("option", { name: "Secular" }).click();
  await wait();
  await expect(page.locator("text=Faith: secular")).toBeVisible();
  await combo3.click();
  await page.getByRole("option", { name: /^All$/ }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 12. HAS CHILDREN — Yes / No / All
  // ────────────────────────────────────────────────
  const childrenYes = fp().getByRole("button", { name: "Yes", exact: true }).first();
  await childrenYes.scrollIntoViewIfNeeded();
  await childrenYes.click();
  await wait();
  await expect(page.locator("text=Children: yes")).toBeVisible();

  await fp().getByRole("button", { name: "No", exact: true }).first().click();
  await wait();
  await expect(page.locator("text=Children: no")).toBeVisible();

  await fp().locator("button:text-is('All')").nth(3).click();
  await wait();

  // ────────────────────────────────────────────────
  // 13. LOOKING FOR — Women, then All
  // ────────────────────────────────────────────────
  const combo4 = fp().getByRole("combobox").nth(4);
  await combo4.scrollIntoViewIfNeeded();
  await combo4.click();
  await page.getByRole("option", { name: "Women" }).click();
  await wait();
  await expect(page.locator("text=Looking for: women")).toBeVisible();
  await combo4.click();
  await page.getByRole("option", { name: /^All$/ }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 14. EDUCATION search
  // ────────────────────────────────────────────────
  const eduInput = fp().getByPlaceholder("Search education...");
  await eduInput.scrollIntoViewIfNeeded();
  await eduInput.fill("University");
  await wait();
  await eduInput.clear();
  await wait();

  // ────────────────────────────────────────────────
  // 15. PROFESSION search
  // ────────────────────────────────────────────────
  const profInput = fp().getByPlaceholder("Search profession...");
  await profInput.scrollIntoViewIfNeeded();
  await profInput.fill("Engineer");
  await wait();
  await profInput.clear();
  await wait();

  // ────────────────────────────────────────────────
  // 16. REGISTERED WITHIN — 3mo preset
  // ────────────────────────────────────────────────
  const reg3mo = fp().getByRole("button", { name: "3mo", exact: true }).first();
  await reg3mo.scrollIntoViewIfNeeded();
  await reg3mo.click();
  await wait();
  await expect(page.locator("text=Registered: last 3mo")).toBeVisible();
  await reg3mo.click();
  await wait();

  // ────────────────────────────────────────────────
  // 17. EVENT ATTENDED WITHIN — 6mo preset
  // ────────────────────────────────────────────────
  const evt6mo = fp().getByRole("button", { name: "6mo", exact: true }).nth(1);
  await evt6mo.scrollIntoViewIfNeeded();
  await evt6mo.click();
  await wait();
  await evt6mo.click();
  await wait();

  // ────────────────────────────────────────────────
  // 18. TOTAL EVENTS ATTENDED — 1+, then All
  // ────────────────────────────────────────────────
  const combo5 = fp().getByRole("combobox").nth(5);
  await combo5.scrollIntoViewIfNeeded();
  await combo5.click();
  await page.getByRole("option", { name: "1+ events" }).click();
  await wait();
  await combo5.click();
  await page.getByRole("option", { name: /^All$/ }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 19. PROFILE UPDATED WITHIN — 1yr preset
  // ────────────────────────────────────────────────
  const upd1yr = fp().getByRole("button", { name: "1yr", exact: true }).last();
  await upd1yr.scrollIntoViewIfNeeded();
  await upd1yr.click();
  await wait();
  await upd1yr.click();
  await wait();

  // ────────────────────────────────────────────────
  // 20-21. HAS PROFILE PHOTO / HAS BIO
  // ────────────────────────────────────────────────
  // Use label-scoped locators
  for (const label of ["Has Profile Photo", "Has Bio"]) {
    const section = fp().locator(`text="${label}"`).locator("..");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Yes" }).click();
    await wait();
    await section.getByRole("button", { name: "All" }).click();
    await wait();
  }

  // ────────────────────────────────────────────────
  // 22-24. SUBSCRIPTIONS — Email / Phone / SMS
  // ────────────────────────────────────────────────
  for (const label of ["Email Newsletter", "Phone Contact", "SMS Messages"]) {
    const section = fp().locator(`text="${label}"`).locator("..");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Subscribed" }).click();
    await wait();
    await section.getByRole("button", { name: "All" }).click();
    await wait();
  }

  // ────────────────────────────────────────────────
  // 25. HAS ADMIN COMMENTS — Yes / All
  // ────────────────────────────────────────────────
  const commentsSection = fp().locator("text=Has Admin Comments").locator("..");
  await commentsSection.scrollIntoViewIfNeeded();
  await commentsSection.getByRole("button", { name: "Yes" }).click();
  await wait();
  await commentsSection.getByRole("button", { name: "All" }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 26. RESET ALL
  // ────────────────────────────────────────────────
  await fp().getByRole("button", { name: "Male", exact: true }).scrollIntoViewIfNeeded();
  await fp().getByRole("button", { name: "Male", exact: true }).click();
  await wait();
  await fp().getByRole("button", { name: "Reset" }).scrollIntoViewIfNeeded();
  await fp().getByRole("button", { name: "Reset" }).click();
  await wait();

  // ────────────────────────────────────────────────
  // 27. NAVIGATE to member detail
  // ────────────────────────────────────────────────
  await fp().getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "United Kingdom" }).click();
  await wait();

  await expect(page.locator("table tbody tr").first()).toBeVisible();
  await page.locator("table tbody tr a").first().click();
  await page.waitForURL("**/admin/members/**");
  expect(page.url()).toContain("/admin/members/");
});
