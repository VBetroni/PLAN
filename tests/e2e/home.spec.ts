import { expect, test } from "@playwright/test";

test("la página de inicio muestra el nombre de la app", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rutina" })).toBeVisible();
});
