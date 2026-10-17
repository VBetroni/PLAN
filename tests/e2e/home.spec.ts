import { expect, test } from "@playwright/test";

test("sin sesión, la app lleva a la pantalla de ingreso", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Rutina" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar con Google" })).toBeVisible();
});
