import { expect, test } from "@playwright/test";

test("loads the Pages build and starts the live surface", async ({ page }) => {
  await page.goto("./");

  await expect(page).toHaveTitle(/WorldVoice/);
  await expect(page.getByRole("heading", { name: "WorldVoice" })).toBeVisible();
  await expect(page.getByLabel("Live sound visualization")).toBeVisible();

  await page.getByRole("tab", { name: /choir/i }).click();
  await expect(page.getByRole("tab", { name: /choir/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.getByRole("button", { name: /start/i }).click();
  await expect(
    page.getByText(/running|tracking|listening|live/i).first(),
  ).toBeVisible();
});
