import { test, expect } from "@playwright/test";

test("Draft", async ({ page, context, request }) => {
  await request.post("http://127.0.0.1:4325/__qa__/reset");
  await page.goto("/products/24");
  await page.getByRole("button", { name: "Сагсанд нэмэх", exact: true }).click();
  await expect(page.locator(".purchase-status")).toContainText("сагсанд нэмэгдлээ");

  await page.goto("/register?next=%2Fcheckout");
  await page.getByLabel("Нэр", { exact: true }).fill("Checkout draft QA");
  await page.getByLabel("Имэйл хаяг", { exact: true }).fill("checkout-draft@example.test");
  await page.getByLabel("Нууц үг", { exact: true }).fill("qa-draft-password");
  await page.getByLabel("Нууц үг давтах", { exact: true }).fill("qa-draft-password");
  await page.getByRole("button", { name: "Бүртгүүлэх", exact: true }).click();
  await page.waitForURL(url => url.pathname === "/checkout");
  await expect(page.locator(".checkout-items > li")).toHaveCount(1);

  const delivery = {
    customer_name: "Хүлээн авагч",
    customer_phone: "99112233",
    shipping_address: "Хан-Уул дүүрэг, 1 хороо, 1 байр, 1 тоот",
    note: "Орой хүргүүлнэ.",
  };
  for (const [name, value] of Object.entries(delivery)) await page.locator(`[name="${name}"]`).fill(value);
  const expectDelivery = async () => {
    for (const [name, value] of Object.entries(delivery)) await expect(page.locator(`[name="${name}"]`)).toHaveValue(value);
  };

  const other = await context.newPage();
  await other.goto("/products/23");
  await other.getByRole("button", { name: "Сагсанд нэмэх", exact: true }).click();
  await expect(page.locator(".checkout-items > li")).toHaveCount(2);
  await expectDelivery();

  await other.goto("/cart");
  await other.locator('.cart-item[data-product-id="23"]').getByRole("button", { name: /сагснаас устгах/ }).click();
  await expect(page.locator(".checkout-items > li")).toHaveCount(1);
  await expectDelivery();

  await other.locator('.cart-item[data-product-id="24"]').getByRole("button", { name: /сагснаас устгах/ }).click();
  await expect(page.getByRole("heading", { name: "Таны сагс хоосон байна", exact: true })).toBeVisible();
  await other.goto("/products/24");
  await other.getByRole("button", { name: "Сагсанд нэмэх", exact: true }).click();
  await expect(page.locator(".checkout-items > li")).toHaveCount(1);
  await expectDelivery();
  const state = await (await request.get("http://127.0.0.1:4325/__qa__/state")).json();
  expect(state.counters.order).toBe(0);
});
