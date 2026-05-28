import { test, expect } from "@playwright/test";

const PAGES = [
  { url: "/", label: "Homepage" },
  { url: "/register", label: "Register" },
  { url: "/login", label: "Login" },
  { url: "/dashboard", label: "Dashboard", allowAuthErrors: true },
];

for (const { url, label, allowAuthErrors } of PAGES) {
  test(`${label} (${url})`, async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Skip auth-related fetch errors on protected pages
        if (allowAuthErrors && (text.includes("401") || text.includes("500"))) return;
        errors.push(`[ERROR] ${text}`);
      } else if (msg.type() === "warning") {
        warnings.push(`[WARN] ${msg.text()}`);
      }
    });

    page.on("pageerror", (err) => {
      errors.push(`[PAGE_ERROR] ${err.message}`);
    });

    await page.context().clearCookies();
    await page.goto(url, { waitUntil: "networkidle" });

    await expect(page.locator("body")).toBeVisible();

    await page.screenshot({ path: `test-results/${label.toLowerCase()}.png`, fullPage: true });

    if (errors.length > 0) {
      console.log(`Errors on ${url}:`, errors);
    }
    if (warnings.length > 0) {
      console.log(`Warnings on ${url}:`, warnings.slice(0, 5));
    }

    expect(errors).toEqual([]);
  });
}
