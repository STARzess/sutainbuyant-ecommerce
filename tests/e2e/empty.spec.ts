import { test, expect } from "@playwright/test";

test("empty API catalog explains empty home sections and product list", async ({ page }) => {
  await page.goto("/"); await expect(page.locator("#categories")).toContainText("Ангилал одоогоор байхгүй байна."); await expect(page.locator("#new-arrivals")).toContainText("Шинэ бүтээгдэхүүн одоогоор байхгүй байна.");
  await page.getByRole("link", { name: "Бүтээгдэхүүн", exact: true }).click(); await expect(page.getByRole("heading", { name: "Тохирох бүтээгдэхүүн олдсонгүй", exact: true })).toBeVisible();
});
