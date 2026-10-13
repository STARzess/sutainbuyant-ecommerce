import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const control = "http://127.0.0.1:4325/__qa__";
const origin = "http://127.0.0.1:3105";
const cartKey = "sutainbuyant.cart.v1";
const details = (page: Page) => page.locator(".profile-form").filter({ has: page.getByRole("button", { name: /Мэдээлэл хадгалах|Хадгалж байна/ }) });
const password = (page: Page) => page.locator(".profile-form").filter({ has: page.getByRole("button", { name: /Нууц үг солих|Солиж байна/ }) });
async function flags(request: APIRequestContext, value: object) { await request.post(`${control}/flags`, { data: value }); }
async function state(request: APIRequestContext) { return (await request.get(`${control}/state`)).json(); }
async function login(page: Page, next = "/account") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Имэйл хаяг", { exact: true }).fill("bat@example.test"); await page.getByLabel("Нууц үг", { exact: true }).fill("qa-password");
  await page.getByRole("button", { name: "Нэвтрэх", exact: true }).click(); await page.waitForURL(url => url.pathname === next);
}
async function cart(page: Page) {
  await page.goto("/products/24"); await page.getByRole("button", { name: "Сагсанд нэмэх", exact: true }).click(); await expect(page.locator(".purchase-status")).toContainText("сагсанд нэмэгдлээ");
}
async function noOverflow(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy(); }
test.beforeEach(async ({ request }) => { await request.post(`${control}/reset`); });

test("Catalog", async ({ page }) => {
  await page.goto("/products"); await expect(page.locator(".catalog-grid .product-card")).toHaveCount(9);
  await page.locator('input[name="category"][value="3"]').check(); await page.locator('select[name="tag"]').selectOption("2");
  await page.locator('input[name="min"]').fill("24000"); await page.locator('input[name="max"]').fill("24000"); await page.locator('input[name="q"]').fill("Бүтээгдэхүүн 24"); await page.locator('select[name="sort"]').selectOption("price-asc");
  await page.waitForURL(url => url.searchParams.get("sort") === "price-asc"); await expect(page.locator(".catalog-grid .product-card")).toHaveCount(1);
  const previous = new URL(page.url()).pathname + new URL(page.url()).search;
  expect(new URL(page.url()).searchParams.get("category")).toBe("3"); expect(new URL(page.url()).searchParams.get("tag")).toBe("2");
  await page.locator(".catalog-grid .product-card-link").first().click(); await page.locator("#product-title").waitFor(); await expect(page.locator(".detail-return")).toHaveAttribute("href", previous);
  await page.locator(".detail-return").click(); await expect(page.locator(".catalog-grid .product-card")).toHaveCount(1);
  await page.goto("/products?sort=price-desc&page=2"); await expect(page.locator('.pagination [aria-current="page"]')).toHaveText("2"); await page.getByRole("link", { name: "Дараах хуудас", exact: true }).click(); await page.waitForURL(url => url.searchParams.get("page") === "3");
  await page.goto("/products?q=no-matching-product"); await expect(page.getByRole("heading", { name: "Тохирох бүтээгдэхүүн олдсонгүй", exact: true })).toBeVisible();
  await page.goto("/products?min=100&max=0"); await expect(page.locator("#price-error")).toBeVisible();
});

test("Details", async ({ page }) => {
  await page.goto("/products/24"); await expect(page.locator("#product-title")).toHaveText("Бүтээгдэхүүн 24");
  await expect(page).toHaveTitle(/Бүтээгдэхүүн 24/); await expect(page.locator('head meta[name="description"]')).toHaveAttribute("content", /Бүтээгдэхүүн 24/);
  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "index, follow"); await expect(page.locator(".detail-related .product-card")).toHaveCount(4);
  await page.getByRole("button", { name: /зургийг томруулах/ }).click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Cart", async ({ page, context }) => {
  await cart(page); await page.locator(".header-cart-link").click(); await expect(page.locator('[data-testid="cart-total"]')).toHaveText("24,000 ₮");
  await page.reload(); await expect(page.locator(".cart-item")).toHaveCount(1);
  const other = await context.newPage(); await other.goto("/cart"); await other.getByRole("button", { name: /тоо ширхэг нэмэх/ }).click(); await expect(page.locator('[data-testid="cart-total"]')).toHaveText("48,000 ₮");
  await other.getByRole("button", { name: /сагснаас устгах/ }).click(); await expect(page.getByRole("heading", { name: "Таны сагс хоосон байна", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]"), cartKey)).toEqual([]);
});

test("Authorization", async ({ page, request }) => {
  for (const next of ["/account", "/orders", "/checkout"]) { await page.goto(next); await page.waitForURL(url => url.pathname === "/login" && url.searchParams.get("next") === next); }
  for (const route of ["profile", "profile/password"]) expect((await request.put(`/api/shop/${route}`, { headers: { Origin: origin }, data: {} })).status()).toBe(401);
  expect((await request.post("/api/shop/orders", { headers: { Origin: origin }, data: {} })).status()).toBe(401);
  expect((await state(request)).counters.order).toBe(0);
});

test("Registration", async ({ page, context }) => {
  await page.goto("/register"); await page.getByLabel("Нэр", { exact: true }).fill("Шинэ хэрэглэгч"); await page.getByLabel("Имэйл хаяг", { exact: true }).fill("bat@example.test"); await page.getByLabel("Нууц үг", { exact: true }).fill("qa-password"); await page.getByLabel("Нууц үг давтах", { exact: true }).fill("different");
  await page.getByRole("button", { name: "Бүртгүүлэх", exact: true }).click(); await expect(page.locator('[name="password_confirmation"]')).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Нууц үг давтах", { exact: true }).fill("qa-password"); await page.getByRole("button", { name: "Бүртгүүлэх", exact: true }).click(); await expect(page.locator(".form-field-error")).toContainText("Энэ имэйл хаяг бүртгэлтэй байна.");
  await page.getByLabel("Имэйл хаяг", { exact: true }).fill("new@example.test"); await page.getByRole("button", { name: "Бүртгүүлэх", exact: true }).click(); await page.waitForURL(url => url.pathname === "/account");
  await expect(page.locator(".header-account-link")).toHaveText("Миний бүртгэл"); const cookie = (await context.cookies()).find(cookie => cookie.name === "sb_session"); expect(cookie?.httpOnly).toBeTruthy(); expect(cookie?.sameSite).toBe("Lax");
  expect(await page.evaluate(() => document.cookie + JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }))).not.toContain(cookie!.value);
  await page.reload(); await expect(page.locator(".account-welcome")).toContainText("Шинэ хэрэглэгч");
});

test("Profile", async ({ page, request }) => {
  await login(page); await flags(request, { profileWriteFailure: true });
  await details(page).getByLabel("Нэр", { exact: true }).fill("Бат шинэ"); await details(page).getByRole("button", { name: "Мэдээлэл хадгалах", exact: true }).click();
  await expect(page.locator(".account-welcome")).toContainText("Бат шинэ"); await expect(page.getByRole("button", { name: "Гарах", exact: true })).toBeDisabled();
  await expect(details(page).locator(".form-message")).toContainText("баталгаажуулж чадсангүй"); await expect(page.locator(".account-welcome")).toHaveText("Сайн байна уу, Бат."); await expect(details(page).getByLabel("Нэр", { exact: true })).toHaveValue("Бат шинэ");
  await flags(request, { profileWriteFailure: false }); await details(page).getByRole("button", { name: "Мэдээлэл хадгалах", exact: true }).click(); await expect(details(page).locator(".profile-success")).toHaveText("Мэдээлэл амжилттай шинэчлэгдлээ.");
  await page.reload(); await expect(page.locator(".account-welcome")).toContainText("Бат шинэ"); expect((await state(request)).counters.profile).toBe(2);
});

test("Password", async ({ page, context }) => {
  await cart(page); await login(page); await password(page).getByLabel("Одоогийн нууц үг", { exact: true }).fill("wrong-password"); await password(page).getByLabel("Шинэ нууц үг", { exact: true }).fill("new-password"); await password(page).getByLabel("Нууц үг давтах", { exact: true }).fill("new-password"); await password(page).getByRole("button", { name: "Нууц үг солих", exact: true }).click();
  await expect(password(page).locator(".form-field-error")).toHaveText("Одоогийн нууц үг буруу байна."); await password(page).getByLabel("Одоогийн нууц үг", { exact: true }).fill("qa-password");
  await password(page).getByRole("button", { name: "Шинэ нууц үг харуулах", exact: true }).click(); await password(page).getByRole("button", { name: "Нууц үг солих", exact: true }).click(); await expect(password(page).locator(".profile-success")).toHaveText("Нууц үг амжилттай солигдлоо.");
  for (const name of ["current_password", "password", "password_confirmation"]) { await expect(password(page).locator(`[name="${name}"]`)).toHaveValue(""); await expect(password(page).locator(`[name="${name}"]`)).toHaveAttribute("type", "password"); }
  await page.getByRole("button", { name: "Гарах", exact: true }).click(); await page.waitForURL(url => url.pathname === "/login"); await expect(page.locator(".header-account-link")).toHaveText("Нэвтрэх"); expect((await context.cookies()).some(cookie => cookie.name === "sb_session")).toBeFalsy();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]").length, cartKey)).toBe(1);
});

test("Checkout", async ({ page, request }) => {
  await cart(page); await login(page, "/checkout"); await page.getByRole("button", { name: "Захиалгаа баталгаажуулах", exact: true }).click(); await expect(page.locator('[name="customer_phone"]')).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Утасны дугаар", { exact: true }).fill("99112233"); await page.getByLabel("Хүргэлтийн хаяг", { exact: true }).fill("Хан-Уул дүүрэг, 1 хороо, 1 байр, 1 тоот"); await flags(request, { checkoutInvalid: true });
  await page.getByRole("button", { name: "Захиалгаа баталгаажуулах", exact: true }).click(); await expect(page.locator('[name="customer_phone"]')).toHaveAttribute("aria-invalid", "true"); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]").length, cartKey)).toBe(1);
  await flags(request, { checkoutInvalid: false }); await page.getByRole("button", { name: "Захиалгаа баталгаажуулах", exact: true }).click(); await page.getByRole("button", { name: "Захиалгыг илгээж байна…", exact: true }).evaluate((button: HTMLButtonElement) => button.click());
  await page.waitForURL(url => /^\/orders\/\d+$/.test(url.pathname)); await expect(page.locator(".order-heading h1")).toContainText("ORD-"); expect((await state(request)).counters.order).toBe(2); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]").length, cartKey)).toBe(0);
});

test("Orders", async ({ page, request }) => {
  await login(page, "/orders"); await expect(page.locator(".orders-card")).toHaveCount(3); expect(await page.content()).not.toContain("PRIVATE-DELIVERY");
  await page.getByLabel("Захиалгын төлөв", { exact: true }).selectOption("pending"); await expect(page.locator(".orders-card")).toHaveCount(1); await page.getByRole("link", { name: "ORD-101 дэлгэрэнгүй", exact: true }).click();
  await page.getByRole("button", { name: "Захиалга цуцлах", exact: true }).click(); await page.getByRole("button", { name: "Болих", exact: true }).click(); expect((await state(request)).counters.cancel).toBe(0);
  await page.getByRole("button", { name: "Захиалга цуцлах", exact: true }).click(); await page.getByRole("button", { name: "Цуцлахыг баталгаажуулах", exact: true }).click(); await page.getByRole("button", { name: "Цуцалж байна…", exact: true }).evaluate((button: HTMLButtonElement) => button.click()); await expect(page.locator(".order-status:visible")).toHaveText("Цуцлагдсан"); expect((await state(request)).counters.cancel).toBe(1);
  await page.getByRole("link", { name: "Миний захиалгууд", exact: true }).click(); await page.getByLabel("Захиалгын төлөв", { exact: true }).selectOption("all"); await expect(page.locator('.orders-card[data-order-id="101"] .order-status')).toHaveText("Цуцлагдсан");
});

test("Security", async ({ page }) => {
  await login(page);
  const evil = await page.request.put("/api/shop/profile", { headers: { Origin: "https://evil.example" }, data: { name: "Bad", email: "bad@example.test" } }); expect(evil.status()).toBe(403);
  const forbidden = await page.request.post("/api/shop/orders/900/cancel", { headers: { Origin: origin }, data: {} }); expect(forbidden.status()).toBe(404); expect(await forbidden.text()).not.toContain("PRIVATE-DELIVERY");
  const update = await page.request.put("/api/shop/profile", { headers: { Origin: origin }, data: { id: 2, role: "admin", token: "forged", name: "Бат", email: "bat@example.test" } }); expect(update.status()).toBe(200); expect(update.headers()["cache-control"]).toBe("private, no-store"); expect(await update.text()).not.toContain("PRIVATE-TOKEN");
  const current = await state(page.request); expect(current.writes.at(-1).fields).toEqual(["name", "email"]); expect(current.writes.at(-1).userId).toBe(1);
  const order = await page.request.post("/api/shop/orders", { headers: { Origin: origin }, data: { customer_name: "Бат", customer_phone: "99112233", shipping_address: "Хан-Уул, 1 хороо, 1 байр", note: "", user_id: 2, total: 1, items: [{ product_id: 24, quantity: 1, unit_price: 1 }] } }); expect(order.status()).toBe(201);
  const afterOrder = await state(page.request); expect(afterOrder.writes.at(-1).userId).toBe(1); expect(afterOrder.writes.at(-1).itemFields).toEqual(["product_id", "quantity"]); expect(afterOrder.orders.find((item: { id: number }) => item.id === 201).total).toBe(24000);
});

test("Retry", async ({ page }) => {
  await cart(page); await page.route("**/api/shop/cart-products?*", route => route.fulfill({ status: 503, contentType: "application/json", body: "{}" })); await page.goto("/cart"); await expect(page.getByRole("heading", { name: "Бүтээгдэхүүнийг ачаалж чадсангүй", exact: true })).toBeVisible(); await expect(page.locator('[data-testid="cart-total"]')).toHaveCount(0);
  await page.unroute("**/api/shop/cart-products?*"); await page.getByRole("button", { name: "Дахин оролдох", exact: true }).click(); await expect(page.locator('[data-testid="cart-total"]')).toHaveText("24,000 ₮");
});

test("Responsive", async ({ page }) => {
  await page.goto("/"); await page.getByRole("button", { name: "Харанхуй горимд шилжих", exact: true }).click(); await expect(page.locator("html")).toHaveAttribute("data-theme", "dark"); await page.reload(); await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  for (const width of [320, 390, 768, 1440]) { await page.setViewportSize({ width, height: 1000 }); for (const route of ["/", "/products", "/products/24", "/cart", "/login"]) { await page.goto(route); await page.locator("main h1").first().waitFor(); await noOverflow(page); } }
  await login(page); await noOverflow(page); await page.goto("/orders"); await noOverflow(page);
});

for (const theme of ["light", "dark"] as const) {
  test(`Accessibility (${theme})`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem("sutainbuyant.theme.v1", value), theme);
    for (const route of ["/", "/products", "/products/24", "/login", "/register", "/cart"]) {
      await page.goto(route); await page.locator("main h1").first().waitFor();
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, html: node.html, summary: node.failureSummary })) })), route).toEqual([]);
    }
    await login(page); const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze(); expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
  });
}
