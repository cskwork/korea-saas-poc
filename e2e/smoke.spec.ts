import { expect, test } from "@playwright/test";
import { MODULES } from "../src/pocs/registry";

test("health check reports a working database", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).status).toBe("ok");
});

test("hub lists every module", async ({ page }) => {
  await page.goto("/");
  for (const module of MODULES) {
    await expect(page.locator(`a[href="/${module.slug}"]`).first()).toBeVisible();
  }
});

for (const module of MODULES) {
  test(`${module.slug} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const response = await page.goto(`/${module.slug}`);
    expect(response?.status(), "HTTP status").toBeLessThan(400);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page).toHaveTitle(/.+/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "no horizontal overflow").toBeLessThanOrEqual(1);
    expect(errors, "no console errors").toEqual([]);
  });
}

test("legacy static URLs redirect to modules", async ({ page }) => {
  await page.goto("/pocs/03-micro-saas/");
  await expect(page).toHaveURL(/\/micro-saas$/);
});
