import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const cartKey = "sutainbuyant.cart.v1";

async function expectAccessible(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
}

async function expectPurchaseVisible(page: Page) {
  const box = await page.locator(".product-purchase").boundingBox();
  const viewport = page.viewportSize()!;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
}

test.beforeEach(async ({ request }) => {
  await request.post("http://127.0.0.1:4325/__qa__/reset");
});

for (const width of [320, 390]) {
  test(`Purchase (${width}px)`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/products/24");
    const purchase = page.locator(".product-purchase");
    const add = page.getByRole("button", { name: "Сагсанд нэмэх", exact: true });
    await expect(purchase).toHaveCount(1);
    await expect(add).toHaveCount(1);
    await expect(add).toBeEnabled();
    expect(await purchase.evaluate(element => getComputedStyle(element).position)).toBe("fixed");
    await expectPurchaseVisible(page);

    await page.locator('.product-purchase input[name="quantity"]').fill("3");
    await add.click();
    await expect(page.locator(".purchase-status")).toHaveText("3 ширхэг сагсанд нэмэгдлээ.");
    await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]"), cartKey)).toEqual([{ id: "24", quantity: 3 }]);
    await expectAccessible(page);

    await page.reload();
    await expect(page.locator(".purchase-status")).toHaveText("Сагсанд 3 ширхэг байна.");
    await expectPurchaseVisible(page);
    const other = await context.newPage();
    await other.goto("/cart");
    await expect(other.locator('[data-testid="cart-total"]')).toHaveText("72,000 ₮");
    await other.getByRole("button", { name: "Бүтээгдэхүүн 24 тоо ширхэг нэмэх", exact: true }).click();
    await expect(other.locator('[data-testid="cart-total"]')).toHaveText("96,000 ₮");
    await expect(page.locator(".purchase-status")).toHaveText("Сагсанд 4 ширхэг байна.");
    await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]"), cartKey)).toEqual([{ id: "24", quantity: 4 }]);

    await page.getByRole("button", { name: "Харанхуй горимд шилжих", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectAccessible(page);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expectPurchaseVisible(page);
    const phone = page.locator('.site-footer a[href="tel:+97677669999"]');
    await expect(phone).toBeInViewport();
    const phoneBox = await phone.boundingBox();
    const purchaseBox = await purchase.boundingBox();
    expect(phoneBox!.y + phoneBox!.height).toBeLessThanOrEqual(purchaseBox!.y);

    await page.setViewportSize({ width: 1440, height: 1000 });
    expect(await purchase.evaluate(element => getComputedStyle(element).position)).toBe("static");
    await page.setViewportSize({ width, height: 800 });
    expect(await purchase.evaluate(element => getComputedStyle(element).position)).toBe("fixed");
    await expectPurchaseVisible(page);
  });
}

test("Desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/products/24");
  await expect(page.getByRole("button", { name: "Сагсанд нэмэх", exact: true })).toBeEnabled();
  await expect(page.locator(".product-purchase")).toHaveCount(1);
  expect(await page.locator(".product-purchase").evaluate(element => getComputedStyle(element).position)).toBe("static");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
});
