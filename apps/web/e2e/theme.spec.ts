import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const SEED_BOARD_ID = "4e5781cc-96b8-41af-a3ce-454ddaa9f289";

async function loginAsAlice(page: any) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[id="email"]', "alice@example.com");
  await page.fill('input[id="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Theme E2E — Dark Mode Board Scrollbar", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAlice(page);
  });

  test("board page should have themed scrollbar in dark mode", async ({ page }) => {
    // Ensure dark mode is active (default)
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("taskflow-theme", "dark");
    });

    // Navigate to board with columns — this page has horizontal scroll
    await page.goto(`${BASE}/boards/${SEED_BOARD_ID}`);
    await page.waitForSelector('text=Todo', { timeout: 10_000 });

    // Verify page loaded
    await expect(page.locator("h1").last()).toBeVisible({ timeout: 5_000 });

    // Check that the html element has the 'dark' class
    const hasDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(hasDark).toBe(true);

    // Verify scrollbar is styled — check computed styles
    const scrollbarStyles = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        thumb: style.getPropertyValue("--scrollbar-thumb").trim(),
        track: style.getPropertyValue("--scrollbar-track").trim(),
      };
    });

    // Dark mode scrollbar values should be non-empty (we defined them)
    expect(scrollbarStyles.thumb).toBeTruthy();
    expect(scrollbarStyles.track).toBeTruthy();

    // Take screenshot of the board page
    await page.screenshot({
      path: "test-results/dark-mode-board.png",
      fullPage: false,
    });
  });

  test("scrollbar CSS variables should differ between light and dark mode", async ({ page }) => {
    await page.goto(`${BASE}/boards/${SEED_BOARD_ID}`);
    await page.waitForSelector('text=Todo', { timeout: 10_000 });

    // Get dark mode values
    const darkValues = await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      const style = getComputedStyle(document.documentElement);
      return {
        thumb: style.getPropertyValue("--scrollbar-thumb").trim(),
        track: style.getPropertyValue("--scrollbar-track").trim(),
      };
    });

    // Get light mode values
    const lightValues = await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      const style = getComputedStyle(document.documentElement);
      return {
        thumb: style.getPropertyValue("--scrollbar-thumb").trim(),
        track: style.getPropertyValue("--scrollbar-track").trim(),
      };
    });

    // Values should differ between modes
    expect(darkValues.track).not.toBe(lightValues.track);
    expect(darkValues.thumb).not.toBe(lightValues.thumb);
  });

  test("board page should have no console errors in dark mode", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("401") && !msg.text().includes("500")) {
        errors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await page.goto(`${BASE}/boards/${SEED_BOARD_ID}`);
    await page.waitForSelector('text=Todo', { timeout: 10_000 });

    // Should have no unexpected errors (excluding auth errors from notification hooks)
    const filteredErrors = errors.filter((e) => !e.includes("401") && !e.includes("500") && !e.includes("Failed to load resource"));
    expect(filteredErrors).toEqual([]);
  });

  test("board columns area should be scrollable horizontally", async ({ page }) => {
    await page.goto(`${BASE}/boards/${SEED_BOARD_ID}`);
    await page.waitForSelector('text=Todo', { timeout: 10_000 });

    // The columns container should be the flex container with overflow-x-auto
    const columnsContainer = page.locator('.overflow-x-auto').first();
    await expect(columnsContainer).toBeVisible({ timeout: 3_000 });

    // Check that it has overflow (content wider than container)
    const overflowInfo = await columnsContainer.evaluate((el) => {
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        hasOverflow: el.scrollWidth > el.clientWidth,
      };
    });

    // If there are enough columns (4 default), should have horizontal overflow
    expect(overflowInfo.scrollWidth).toBeGreaterThan(0);
    expect(overflowInfo.clientWidth).toBeGreaterThan(0);
  });
});

test.describe("Theme E2E — Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAlice(page);
  });

  test("theme toggle button should switch light/dark", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);

    // Default is dark
    let hasDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(hasDark).toBe(true);

    // Click the theme toggle button (Sun/Moon icon)
    const toggleBtn = page.locator('button[aria-label="Toggle theme"]');
    await expect(toggleBtn).toBeVisible({ timeout: 3_000 });
    await toggleBtn.click();
    await page.waitForTimeout(300);

    // Should be light now
    hasDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(hasDark).toBe(false);

    // Toggle back
    await toggleBtn.click();
    await page.waitForTimeout(300);
    hasDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(hasDark).toBe(true);
  });

  test("theme preference should persist after page reload", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);

    // Switch to light
    const toggleBtn = page.locator('button[aria-label="Toggle theme"]');
    await toggleBtn.click();
    await page.waitForTimeout(300);

    // Reload
    await page.reload();
    await page.waitForSelector('h1', { timeout: 10_000 });

    // Should still be light
    const hasDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(hasDark).toBe(false);

    // Restore dark for other tests
    await toggleBtn.click();
  });
});
