import { test, expect } from "@playwright/test";

const mockApi = "http://127.0.0.1:4325";

test.beforeEach(async ({ request }) => {
  await request.post(`${mockApi}/__qa__/reset`);
});

test("404", async ({ page }) => {
  const response = await page.goto("/route-that-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Хуудас олдсонгүй", exact: true })).toBeVisible();
  await expect(page).toHaveTitle("Хуудас олдсонгүй | Сутайн Буянт");
  const robots = await page.locator('meta[name="robots"]').evaluateAll(elements => elements.map(element => element.getAttribute("content") || "").join(","));
  expect(robots).toContain("noindex");
  await expect(page.locator(".not-found-actions").getByRole("link", { name: "Нүүр хуудас", exact: true })).toHaveAttribute("href", "/");
  await page.locator(".not-found-actions").getByRole("link", { name: "Бүтээгдэхүүн үзэх", exact: true }).click();
  await page.waitForURL(url => url.pathname === "/products");
  await expect(page.locator(".catalog-grid .product-card")).toHaveCount(9);
});

test("Metadata", async ({ page }) => {
  const descriptions: string[] = [];
  for (const [route, title] of [["/login", "Нэвтрэх"], ["/register", "Бүртгүүлэх"]]) {
    await page.goto(route);
    await expect(page).toHaveTitle(`${title} | Сутайн Буянт`);
    const description = await page.locator('head meta[name="description"]').getAttribute("content");
    expect(description).toMatch(/[А-Яа-яӨөҮү]/);
    expect(description!.length).toBeGreaterThan(30);
    descriptions.push(description!);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  }

  await page.goto("/login?next=%2Faccount");
  await page.getByLabel("Имэйл хаяг", { exact: true }).fill("bat@example.test");
  await page.getByLabel("Нууц үг", { exact: true }).fill("qa-password");
  await page.getByRole("button", { name: "Нэвтрэх", exact: true }).click();
  await page.waitForURL(url => url.pathname === "/account");

  for (const [route, title] of [["/checkout", "Захиалга хийх"], ["/account", "Миний бүртгэл"], ["/orders", "Миний захиалгууд"], ["/orders/101", "Захиалгын дэлгэрэнгүй"]]) {
    await page.goto(route);
    await expect(page).toHaveTitle(`${title} | Сутайн Буянт`);
    const description = await page.locator('head meta[name="description"]').getAttribute("content");
    expect(description).toMatch(/[А-Яа-яӨөҮү]/);
    expect(description!.length).toBeGreaterThan(30);
    descriptions.push(description!);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  }
  expect(new Set(descriptions).size).toBe(6);
});

test("OG", async ({ page }) => {
  for (const route of ["/", "/products", "/products/24"]) {
    await page.goto(route);
    await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute("content", new URL("/default.png", page.url()).href);
    await expect(page.locator('head meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('head meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('head meta[property="og:image:alt"]')).toHaveAttribute("content", "Сутайн Буянт онлайн дэлгүүр");
    await expect(page.locator('head meta[name="twitter:image"]')).toHaveAttribute("content", new URL("/default.png", page.url()).href);
  }
  await expect(page).toHaveTitle(/Бүтээгдэхүүн 24/);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", new URL("/products/24", page.url()).href);
});

test("Images", async ({ page, request }) => {
  const pngResponse = await request.get("/default.png");
  expect(pngResponse.status()).toBe(200);
  expect(pngResponse.headers()["content-type"]).toContain("image/png");
  const png = await pngResponse.body();
  expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);

  const icoResponse = await request.get("/favicon.ico");
  expect(icoResponse.status()).toBe(200);
  const ico = await icoResponse.body();
  expect(ico.readUInt16LE(0)).toBe(0);
  expect(ico.readUInt16LE(2)).toBe(1);
  const count = ico.readUInt16LE(4);
  expect(count).toBeGreaterThan(0);
  expect(ico.length).toBeGreaterThanOrEqual(6 + count * 16);
  for (let index = 0; index < count; index++) {
    const entry = 6 + index * 16;
    const bytes = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    expect(bytes).toBeGreaterThan(0);
    expect(offset).toBeGreaterThanOrEqual(6 + count * 16);
    expect(offset + bytes).toBeLessThanOrEqual(ico.length);
  }

  const svgResponse = await request.get("/icon.svg");
  expect(svgResponse.status()).toBe(200);
  expect(svgResponse.headers()["content-type"]).toContain("image/svg+xml");
  const svg = await svgResponse.text();
  await page.goto("/");
  const icon = await page.evaluate(source => {
    const document = new DOMParser().parseFromString(source, "image/svg+xml");
    return { tag: document.documentElement.localName, label: document.documentElement.getAttribute("aria-label"), viewBox: document.documentElement.getAttribute("viewBox"), invalid: Boolean(document.querySelector("parsererror")) };
  }, svg);
  expect(icon.invalid).toBe(false);
  expect(icon.tag).toBe("svg");
  expect(icon.label).toBe("Сутайн Буянт");
  expect(icon.viewBox).toBeTruthy();
  const iconUrls = await page.locator('head link[rel="icon"]').evaluateAll(elements => elements.map(element => new URL(element.getAttribute("href") || "", location.href).pathname));
  expect(iconUrls).toContain("/favicon.ico");
  expect(iconUrls).toContain("/icon.svg");
});
