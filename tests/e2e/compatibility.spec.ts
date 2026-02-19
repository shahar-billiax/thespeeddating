/**
 * Compatibility Questionnaire — end-to-end tests
 *
 * All authenticated tests share a single browser context so we only log in
 * ONCE per run — avoiding the auth rate-limit (10 logins/min/IP) that breaks
 * suites where each test calls loginAsAdmin in its own beforeEach.
 *
 * Each test navigates to the page it needs; persistent session cookies carry
 * over through the shared context.
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ─── Config ──────────────────────────────────────────────────────
test.setTimeout(120_000);

test.use({
  viewport: { width: 1440, height: 900 },
  video: "off",
});

// ─── Credentials ─────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";
const ADMIN_EMAIL = "admin@thespeeddating.co.uk";
const ADMIN_PASSWORD = "admin123456";

// ─── Auth guard (no login required) ─────────────────────────────

test.describe("Compatibility — auth guard", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/compatibility`);
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });
});

// ─── All authenticated tests share ONE login session ─────────────
//
// We create the browser context in beforeAll, log in once, then every
// individual test reuses `pg` — a Page inside that context.

test.describe("Compatibility — authenticated", () => {
  test.describe.configure({ mode: "serial" });

  let ctx: BrowserContext;
  let pg: Page;

  test.beforeAll(async ({ browser }) => {
    ctx = await browser.newContext({ baseURL: BASE_URL });
    pg = await ctx.newPage();

    // Login once
    await pg.goto("/login");
    await expect(pg.getByLabel(/email/i)).toBeVisible({ timeout: 30_000 });
    await pg.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await pg.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await pg.getByRole("button", { name: /sign in|log in/i }).click();
    await pg.waitForURL("**/dashboard**", { timeout: 60_000 });

    // Dismiss cookie consent banner for the entire session — it sits fixed at the
    // bottom of the page and blocks clicks on elements near the bottom of forms.
    await pg.evaluate(() => localStorage.setItem("cookie-consent", "accepted"));
  });

  test.afterAll(async () => {
    await ctx.close();
  });

  // Helper: navigate to compatibility page (reuses session)
  async function goToCompatibility(tab?: "life" | "assessment" | "preferences" | "matches") {
    await pg.goto(`/compatibility${tab ? `?tab=${tab}` : ""}`);
    await expect(pg.getByText("Deep Compatibility")).toBeVisible({ timeout: 15_000 });
  }

  // ── Page structure ────────────────────────────────────────────

  test("page structure: shows all four tabs", async () => {
    await goToCompatibility();
    await expect(pg.getByRole("tab", { name: /life alignment/i })).toBeVisible();
    await expect(pg.getByRole("tab", { name: /assessment/i })).toBeVisible();
    await expect(pg.getByRole("tab", { name: /preferences/i })).toBeVisible();
    await expect(pg.getByRole("tab", { name: /my matches/i })).toBeVisible();
  });

  test("page structure: shows overall progress bar", async () => {
    await goToCompatibility();
    await expect(pg.getByText("Profile Completion")).toBeVisible();
    await expect(pg.locator('[role="progressbar"]').first()).toBeVisible();
  });

  test("page structure: shows three step indicators", async () => {
    await goToCompatibility();
    await expect(pg.getByText("Life Alignment").first()).toBeVisible();
    await expect(pg.getByText("Assessment").first()).toBeVisible();
    await expect(pg.getByText("Dealbreaker Preferences")).toBeVisible();
  });

  test("page structure: step indicator buttons navigate to correct tab", async () => {
    await goToCompatibility();
    // First switch away from the default tab, then click the step-indicator for Assessment
    await pg.getByRole("tab", { name: /preferences/i }).click();
    // Step indicator buttons sit above the Tabs component — find the one labeled "Assessment"
    // that is NOT the tab trigger itself (the tab trigger is inside [role="tablist"])
    const tablist = pg.locator('[role="tablist"]');
    const assessmentStepBtn = pg.getByRole("button", { name: /assessment/i })
      .filter({ hasNot: tablist });
    await assessmentStepBtn.first().click();
    await expect(pg.getByRole("tab", { name: /assessment/i })).toHaveAttribute("data-state", "active");
  });

  // ── Life Alignment tab ────────────────────────────────────────

  test("life alignment: all form sections visible", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    await expect(pg.getByText("Religion & Values", { exact: true })).toBeVisible();
    await expect(pg.getByText("Family & Children", { exact: true })).toBeVisible();
    await expect(pg.getByText("Education & Career", { exact: true })).toBeVisible();
    // exact:true prevents matching "about yourself" in the card description
    await expect(pg.getByText("About You", { exact: true })).toBeVisible();
  });

  test("life alignment: religion dropdown lists all options", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    await expect(pg.getByText("Religion & Values", { exact: true })).toBeVisible();

    // First combobox inside the Religion & Values card
    const faithCard = pg.getByText("Religion & Values", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    await faithCard.getByRole("combobox").first().click();
    await expect(pg.getByRole("option", { name: "Jewish - Orthodox" })).toBeVisible();
    await expect(pg.getByRole("option", { name: "Jewish - Reform" })).toBeVisible();
    await expect(pg.getByRole("option", { name: "Not religious" })).toBeVisible();
    await pg.keyboard.press("Escape");
  });

  test("life alignment: religion dropdown selects a value", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const faithCard = pg.getByText("Religion & Values", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    const faithTrigger = faithCard.getByRole("combobox").first();
    await faithTrigger.click();
    await pg.getByRole("option", { name: "Jewish - Reform" }).click();
    await expect(faithTrigger).toContainText("Jewish - Reform");
  });

  test("life alignment: practice frequency dropdown selects a value", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const faithCard = pg.getByText("Religion & Values", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    const freqTrigger = faithCard.getByRole("combobox").nth(1);
    await freqTrigger.click();
    await pg.getByRole("option", { name: "Weekly" }).click();
    await expect(freqTrigger).toContainText("Weekly");
  });

  test("life alignment: children timeline hidden when wants_children is No", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const familyCard = pg.getByText("Family & Children", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    const wantsTrigger = familyCard.getByRole("combobox").nth(1);
    await wantsTrigger.click();
    await pg.getByRole("option", { name: "No" }).click();
    await expect(pg.getByText("Timeline for children")).not.toBeVisible();
  });

  test("life alignment: children timeline visible when wants_children is Yes", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const familyCard = pg.getByText("Family & Children", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    const wantsTrigger = familyCard.getByRole("combobox").nth(1);
    await wantsTrigger.click();
    await pg.getByRole("option", { name: "Yes" }).click();
    await expect(pg.getByText("Timeline for children")).toBeVisible();
    // Clears when switched back
    await wantsTrigger.click();
    await pg.getByRole("option", { name: "No" }).click();
    await expect(pg.getByText("Timeline for children")).not.toBeVisible();
  });

  test("life alignment: profession dropdown lists expected categories", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const edCard = pg.getByText("Education & Career", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    await edCard.getByRole("combobox").first().click();
    await expect(pg.getByRole("option", { name: "Technology" })).toBeVisible();
    await expect(pg.getByRole("option", { name: "Healthcare" })).toBeVisible();
    await expect(pg.getByRole("option", { name: "Law" })).toBeVisible();
    await pg.keyboard.press("Escape");
  });

  test("life alignment: About You textareas accept input", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const descField = pg.getByPlaceholder(/What makes you, you/i);
    await expect(descField).toBeVisible();
    await descField.fill("I enjoy hiking and cooking.");
    await expect(descField).toHaveValue("I enjoy hiking and cooking.");
  });

  test("life alignment: Save button is visible", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    await expect(pg.getByRole("button", { name: /save life alignment/i })).toBeVisible();
  });

  test("life alignment: partial save allowed — no hard block on missing fields", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    await expect(pg.getByText("Religion & Values", { exact: true })).toBeVisible();

    // Save without touching any selects — should not be blocked
    await pg.getByRole("button", { name: /save life alignment/i }).click();

    // Either succeeds silently or shows the amber hint — never stays frozen
    await expect(
      pg.getByText(/Saved successfully!|Please also fill in/i)
    ).toBeVisible({ timeout: 15_000 });

    // Must stay on the compatibility page
    expect(pg.url()).toContain("/compatibility");
  });

  test("life alignment: full save shows Saved successfully! and no warning", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();

    const faithCard = pg.getByText("Religion & Values", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    await faithCard.getByRole("combobox").first().click();
    await pg.getByRole("option", { name: "Jewish - Reform" }).click();
    await faithCard.getByRole("combobox").nth(1).click();
    await pg.getByRole("option", { name: "Weekly" }).click();

    const familyCard = pg.getByText("Family & Children", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    await familyCard.getByRole("combobox").nth(1).click();
    await pg.getByRole("option", { name: "Open to it" }).click();

    await pg.getByRole("button", { name: /save life alignment/i }).click();
    await expect(pg.getByText("Saved successfully!")).toBeVisible({ timeout: 15_000 });
    await expect(pg.getByText(/Please also fill in/i)).not.toBeVisible();
  });

  // ── Compatibility Assessment tab ──────────────────────────────

  test("assessment: all five category buttons visible", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await expect(pg.getByRole("button", { name: /emotional style/i })).toBeVisible();
    await expect(pg.getByRole("button", { name: /lifestyle.*energy/i })).toBeVisible();
    await expect(pg.getByRole("button", { name: /ambition.*growth/i })).toBeVisible();
    await expect(pg.getByRole("button", { name: /family.*long-term/i })).toBeVisible();
    await expect(pg.getByRole("button", { name: /communication.*bonding/i })).toBeVisible();
  });

  test("assessment: section progress indicator visible", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await expect(pg.getByText(/Section 1 of 5/i)).toBeVisible();
  });

  test("assessment: Save Assessment button on first category", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await expect(pg.getByRole("button", { name: /save assessment/i })).toBeVisible();
  });

  test("assessment: Previous Section disabled on category 1", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await expect(pg.getByRole("button", { name: /previous section/i })).toBeDisabled();
  });

  test("assessment: Next Section navigates forward; Previous becomes enabled", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await pg.getByRole("button", { name: /next section/i }).click();
    await expect(pg.getByText(/Section 2 of 5/i)).toBeVisible();
    await expect(pg.getByRole("button", { name: /previous section/i })).toBeEnabled();
  });

  test("assessment: Previous Section navigates backwards", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await pg.getByRole("button", { name: /next section/i }).click();
    await pg.getByRole("button", { name: /previous section/i }).click();
    await expect(pg.getByText(/Section 1 of 5/i)).toBeVisible();
  });

  test("assessment: clicking a category button jumps to that section", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await pg.getByRole("button", { name: /family.*long-term/i }).click();
    await expect(pg.getByText(/Section 4 of 5/i)).toBeVisible();
  });

  test("assessment: last category has Save button but no Next button", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await pg.getByRole("button", { name: /communication.*bonding/i }).click();
    await expect(pg.getByText(/Section 5 of 5/i)).toBeVisible();
    await expect(pg.getByRole("button", { name: /save assessment/i })).toBeVisible();
    await expect(pg.getByRole("button", { name: /next section/i })).not.toBeVisible();
  });

  test("assessment: 4 sliders per category", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    // Category 1: Emotional Style — 4 sliders
    await expect(pg.locator('[role="slider"]')).toHaveCount(4);
    await pg.getByRole("button", { name: /next section/i }).click();
    // Category 2: Lifestyle & Energy — 4 sliders
    await expect(pg.locator('[role="slider"]')).toHaveCount(4);
  });

  test("assessment: Save Assessment works from category 1 (not just the last)", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await expect(pg.getByText(/Section 1 of 5/i)).toBeVisible();
    await pg.getByRole("button", { name: /save assessment/i }).click();
    await expect(pg.getByText("Saved!")).toBeVisible({ timeout: 15_000 });
  });

  test("assessment: Save Assessment works from the last category", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await pg.getByRole("button", { name: /communication.*bonding/i }).click();
    await pg.getByRole("button", { name: /save assessment/i }).click();
    await expect(pg.getByText("Saved!")).toBeVisible({ timeout: 15_000 });
  });

  // ── Preferences (Dealbreakers) tab ───────────────────────────

  test("preferences: age range inputs visible with valid values", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    // Use the age input — unique to the preferences tab content (step indicator also says "Dealbreaker Preferences")
    await expect(pg.getByLabel(/minimum age/i)).toBeVisible();
    const minAge = pg.getByLabel(/minimum age/i);
    const maxAge = pg.getByLabel(/maximum age/i);
    await expect(minAge).toBeVisible();
    await expect(maxAge).toBeVisible();
    expect(Number(await minAge.inputValue())).toBeGreaterThanOrEqual(18);
    expect(Number(await maxAge.inputValue())).toBeGreaterThanOrEqual(18);
  });

  test("preferences: age inputs accept new values", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    const minAge = pg.getByLabel(/minimum age/i);
    await minAge.fill("30");
    await expect(minAge).toHaveValue("30");
  });

  test("preferences: religion must-match toggle is interactive", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    const toggle = pg.getByRole("switch").nth(0);
    const before = await toggle.getAttribute("data-state");
    await toggle.click();
    expect(await toggle.getAttribute("data-state")).not.toBe(before);
    // Restore original state
    await toggle.click();
  });

  test("preferences: religion badges shown when must-match enabled", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    const toggle = pg.getByRole("switch").nth(0);
    if ((await toggle.getAttribute("data-state")) === "unchecked") {
      await toggle.click();
    }
    await expect(pg.getByText("Jewish - Orthodox")).toBeVisible();
    await expect(pg.getByText("Jewish - Reform")).toBeVisible();
    await expect(pg.getByText("Christian")).toBeVisible();
  });

  test("preferences: religion badges hidden when must-match disabled", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    const toggle = pg.getByRole("switch").nth(0);
    if ((await toggle.getAttribute("data-state")) === "checked") {
      await toggle.click();
    }
    await expect(pg.getByText("Jewish - Orthodox")).not.toBeVisible();
  });

  test("preferences: must-want-children toggle is interactive", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    const toggle = pg.getByRole("switch").nth(1);
    const before = await toggle.getAttribute("data-state");
    await toggle.click();
    expect(await toggle.getAttribute("data-state")).not.toBe(before);
    // Restore
    await toggle.click();
  });

  test("preferences: minimum education slider is present", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    await expect(pg.getByText("Minimum Education Level")).toBeVisible();
    await expect(pg.locator('[role="slider"]')).toBeVisible();
  });

  test("preferences: Save Preferences shows success message", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    await pg.getByRole("button", { name: /save preferences/i }).click();
    await expect(pg.getByText("Saved successfully!")).toBeVisible({ timeout: 15_000 });
  });

  // ── Matches tab ──────────────────────────────────────────────

  test("matches: tab renders valid content", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /my matches/i }).click();
    // Wait for loading state to resolve (MatchResultsList loads async)
    await pg.waitForFunction(
      () => !document.body.innerText.includes("Loading your matches..."),
      { timeout: 15_000 }
    );
    // Either gate card, empty state, or matches list
    const hasGate = await pg.getByText("Complete Your Profile First").isVisible().catch(() => false);
    const hasMatches = await pg.getByText(/compatibility match/i).isVisible().catch(() => false);
    const hasEmpty = await pg.getByText("No Compatibility Matches Yet").isVisible().catch(() => false);
    expect(hasGate || hasMatches || hasEmpty).toBe(true);
  });

  test("matches: gate CTA navigates to life or assessment tab", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /my matches/i }).click();
    const gateVisible = await pg.getByText("Complete Your Profile First").isVisible().catch(() => false);
    if (!gateVisible) {
      // Matches already unlocked — skip
      return;
    }
    await pg.getByText(/Start Life Alignment|Start Assessment/i).click();
    const lifeActive = await pg.getByRole("tab", { name: /life alignment/i }).getAttribute("data-state");
    const assessActive = await pg.getByRole("tab", { name: /assessment/i }).getAttribute("data-state");
    expect(lifeActive === "active" || assessActive === "active").toBe(true);
  });

  // ── Cross-tab navigation ─────────────────────────────────────

  test("navigation: switching tabs shows correct content", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    // Use the age input — unique to the preferences tab content (step indicator also says "Dealbreaker Preferences")
    await expect(pg.getByLabel(/minimum age/i)).toBeVisible();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    await expect(pg.getByText("Religion & Values", { exact: true })).toBeVisible();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await expect(pg.getByText(/Section 1 of 5/i)).toBeVisible();
  });

  test("navigation: Continue to Assessment link switches tab", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const link = pg.getByText(/Continue to Compatibility Assessment/i);
    if (!(await link.isVisible().catch(() => false))) return; // already complete
    await link.click();
    await expect(pg.getByRole("tab", { name: /assessment/i })).toHaveAttribute("data-state", "active");
  });

  test("navigation: Continue to Dealbreaker Preferences link switches tab", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /assessment/i }).click();
    const link = pg.getByText(/Continue to Dealbreaker Preferences/i);
    if (!(await link.isVisible().catch(() => false))) return; // already complete
    await link.click();
    await expect(pg.getByRole("tab", { name: /preferences/i })).toHaveAttribute("data-state", "active");
  });

  test("navigation: View Your Matches link switches to matches tab", async () => {
    await goToCompatibility();
    await pg.getByRole("tab", { name: /preferences/i }).click();
    const link = pg.getByText(/View Your Matches/i);
    if (!(await link.isVisible().catch(() => false))) return; // not yet unlocked
    await link.click();
    await expect(pg.getByRole("tab", { name: /my matches/i })).toHaveAttribute("data-state", "active");
  });

  // ── Full completion flow ──────────────────────────────────────

  test("full flow: saving all three sections results in 100% progress", async () => {
    await goToCompatibility();

    // Step 1 — Life Alignment (fill required selects, save)
    await pg.getByRole("tab", { name: /life alignment/i }).click();
    const faithCard = pg.getByText("Religion & Values", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    await faithCard.getByRole("combobox").first().click();
    await pg.getByRole("option", { name: "Jewish - Reform" }).click();
    await faithCard.getByRole("combobox").nth(1).click();
    await pg.getByRole("option", { name: "Weekly" }).click();
    const familyCard = pg.getByText("Family & Children", { exact: true })
      .locator("xpath=ancestor::*[contains(@class,'card')]");
    await familyCard.getByRole("combobox").nth(1).click();
    await pg.getByRole("option", { name: "Open to it" }).click();
    await pg.getByRole("button", { name: /save life alignment/i }).click();
    await expect(pg.getByText("Saved successfully!")).toBeVisible({ timeout: 15_000 });

    // Step 2 — Assessment
    await pg.getByRole("tab", { name: /assessment/i }).click();
    await pg.getByRole("button", { name: /save assessment/i }).click();
    await expect(pg.getByText("Saved!")).toBeVisible({ timeout: 15_000 });

    // Step 3 — Preferences
    await pg.getByRole("tab", { name: /preferences/i }).click();
    await pg.getByRole("button", { name: /save preferences/i }).click();
    await expect(pg.getByText("Saved successfully!")).toBeVisible({ timeout: 15_000 });

    // Reload — server re-renders with fresh data, progress should be 100%
    await pg.reload();
    await expect(pg.getByText("100%")).toBeVisible({ timeout: 15_000 });
  });
});
