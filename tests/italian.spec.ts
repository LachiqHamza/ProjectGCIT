import { expect, test } from "@playwright/test";

test("Italian is rendered on the server, including metadata, rooms and accessibility labels", async ({ page, request }) => {
  const response = await request.get("/project-examples");
  const html = await response.text();
  expect(html).toContain('<html lang="it"');
  expect(html).toContain("Esempi di progetto");
  await page.goto("/project-examples");
  await expect(page).toHaveTitle("Esempi di progetto - GCIT Architettura");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esempi di progetto.");
  await expect(page.getByRole("button", { name: "Italiano", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "01 Soggiorno", exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Scegli un piano" })).toBeVisible();
  await page.getByRole("button", { name: "Come esplorare la villa", exact: true }).click();
  await expect(page.getByText("Esplorare la villa", { exact: true })).toBeVisible();
});

test("the language choice persists and changes all visible copy without loading the model", async ({ page, context }) => {
  let modelRequests = 0;
  page.on("request", (r) => { if (r.url().includes("villa-bellavista.glb")) modelRequests++; });
  await page.goto("/project-examples");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Project examples.");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "Explore in 3D" })).toBeVisible();
  expect((await context.cookies()).find((c) => c.name === "gcit-language")?.value).toBe("en");
  await page.reload();
  await expect(page).toHaveTitle("Project Examples - GCIT Architecture");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Italiano", exact: true }).click();
  await expect(page.getByRole("button", { name: "Esplora in 3D" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  expect(modelRequests).toBe(0);
});

test("mobile Italian navigation fits and model errors are translated in both languages", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("**/models/villa-bellavista.glb", (route) => route.abort());
  await page.goto("/project-examples");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Esplora in 3D" }).click();
  await expect(page.getByRole("alert")).toContainText("Impossibile caricare il modello");
  await expect(page.getByRole("button", { name: "Riprova", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("The model could not be loaded");
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
});

test("switching language preserves the loaded viewer, selected room and model request", async ({ page }) => {
  let modelRequests = 0;
  page.on("request", (r) => { if (r.url().includes("villa-bellavista.glb")) modelRequests++; });
  await page.goto("/project-examples#kitchen");
  await expect(page.getByText("VISTA 3D INTERATTIVA", { exact: false })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole("heading", { name: "Cucina", exact: true })).toBeVisible();
  const canvas = await page.getByTestId("villa-canvas").elementHandle();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Kitchen", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#kitchen/);
  expect(await page.getByTestId("villa-canvas").evaluate((node, original) => node === original, canvas)).toBe(true);
  expect(modelRequests).toBe(1);
  await expect(page.getByTestId("villa-canvas")).toHaveAttribute("aria-label", /Interactive Villa Bellavista/);
});
