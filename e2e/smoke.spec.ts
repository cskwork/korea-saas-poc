import { expect, test } from "@playwright/test";
import { MODULES, OPEN_MODULES } from "../src/pocs/registry";
import { isModuleOpen, legacyDemoPath, legacyFolder } from "../src/pocs/slugs";

test("health check reports a working database", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).status).toBe("ok");
});

test("hub lists every module", async ({ page }) => {
  await page.goto("/");
  for (const mod of MODULES) {
    const href = isModuleOpen(mod.slug) ? `/${mod.slug}` : legacyDemoPath(mod.slug);
    await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
  }
});

for (const mod of OPEN_MODULES) {
  test(`${mod.slug} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const response = await page.goto(`/${mod.slug}`);
    expect(response?.status(), "HTTP status").toBeLessThan(400);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page).toHaveTitle(/.+/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "no horizontal overflow").toBeLessThanOrEqual(1);
    expect(errors, "no console errors").toEqual([]);
  });

  test(`${mod.slug} takes over its legacy URL`, async ({ page }) => {
    await page.goto(`/pocs/${legacyFolder(mod.slug)}/`);
    await expect(page).toHaveURL(new RegExp(`/${mod.slug}$`));
  });
}

for (const mod of MODULES.filter((m) => !isModuleOpen(m.slug))) {
  test(`${mod.slug} legacy demo is still served while it is rebuilt`, async ({ page }) => {
    const response = await page.goto(`/pocs/${legacyFolder(mod.slug)}/`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${legacyDemoPath(mod.slug)}$`));
  });
}

test("unknown pages render the 404", async ({ page }) => {
  const response = await page.goto("/no-such-shop");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("가게가 없어요");
});
