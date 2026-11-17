import { expect, test } from "@playwright/test";

// Retain full coverage of the English tour alongside dedicated Italian tests.
test.beforeEach(async ({ context }) => {
  await context.addCookies([{ name: "gcit-language", value: "en", url: "http://127.0.0.1:3000" }]);
});

test("loads on demand, renders the actual villa and navigates rooms and cutaways", async ({ page }) => {
  const errors: string[] = [];
  const failures: string[] = [];
  let modelRequests = 0;
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => { if (r.url().includes("villa-bellavista.glb")) modelRequests++; });
  page.on("requestfailed", (r) => failures.push(`${r.url()} ${r.failure()?.errorText}`));
  await page.goto("/");
  await expect(page).toHaveURL(/project-examples/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Project examples.");
  await expect(page.getByRole("button", { name: "Explore in 3D" })).toBeVisible();
  expect(modelRequests).toBe(0);
  await page.screenshot({ path: "test-results/desktop-poster.png", fullPage: true });
  await page.getByRole("button", { name: "Explore in 3D" }).click();
  await expect(page.getByText("LIVE 3D VIEW", { exact: false })).toBeVisible({ timeout: 60000 });
  await expect(page.getByTestId("villa-canvas")).toBeVisible();
  expect(modelRequests).toBe(1);
  await page.screenshot({ path: "test-results/desktop-3d.png", fullPage: true });
  await page.getByRole("button", { name: "01 Living room", exact: true }).click();
  await expect(page).toHaveURL(/#living/);
  await expect(page.getByRole("button", { name: "01 Living room", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Living room", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back outside" })).toBeVisible();
  // Allow the documented 950ms camera transition to settle before visual capture.
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "test-results/living-room.png", fullPage: true });
  await page.getByRole("button", { name: "Ground floor", exact: true }).click();
  await expect(page.getByText("CUTAWAY VIEW", { exact: false })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "test-results/ground-floor.png", fullPage: true });
  await page.getByRole("button", { name: "First floor", exact: true }).click();
  await expect(page.getByRole("heading", { name: "First floor", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Explore Bedrooms on the floor plan" }).click();
  await expect(page).toHaveURL(/#bedroom/);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Reset camera view" }).click();
  await page.getByRole("button", { name: "Back outside" }).click();
  await page.getByRole("button", { name: "Viewer settings" }).click();
  await page.getByRole("button", { name: "High", exact: true }).click();
  await expect(page.getByRole("button", { name: "High", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.getByRole("button", { name: "Auto-rotate", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause rotation" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Pause rotation" }).click();
  expect(errors).toEqual([]);
  expect(failures.filter((f) => !f.includes("net::ERR_ABORTED"))).toEqual([]);
});

test("mobile layout, keyboard navigation and room deep links", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/project-examples");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to project" })).toBeFocused();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.goto("/project-examples#kitchen");
  await expect(page.getByText("LIVE 3D VIEW", { exact: false })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole("heading", { name: "Kitchen", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/mobile-kitchen.png", fullPage: true });
});

test("model load failure preserves a usable retry path", async ({ page }) => {
  await page.route("**/models/villa-bellavista.glb", (route) => route.abort());
  await page.goto("/project-examples");
  await page.getByRole("button", { name: "Explore in 3D" }).click();
  await expect(page.getByRole("alert")).toContainText("The model could not be loaded");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await page.unroute("**/models/villa-bellavista.glb");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("LIVE 3D VIEW", { exact: false })).toBeVisible({ timeout: 60000 });
});
