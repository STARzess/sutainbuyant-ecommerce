import { test, expect } from "@playwright/test";

const origin = "http://127.0.0.1:3105";
const mockApi = "http://127.0.0.1:4325";

test("Logout", async ({ page, context, request }) => {
  await request.post(`${mockApi}/__qa__/reset`);
  await page.goto("/login?next=%2Faccount");
  await page.getByLabel("Имэйл хаяг", { exact: true }).fill("bat@example.test");
  await page.getByLabel("Нууц үг", { exact: true }).fill("qa-password");
  await page.getByRole("button", { name: "Нэвтрэх", exact: true }).click();
  await page.waitForURL(url => url.pathname === "/account");
  await expect(page.locator(".header-account-link")).toHaveText("Миний бүртгэл");
  const sessionCookie = (await context.cookies()).find(cookie => cookie.name === "sb_session");
  expect(sessionCookie).toBeDefined();
  await request.post(`${mockApi}/__qa__/flags`, { data: { logoutFailure: true } });

  const forbidden = await page.request.post("/api/auth/logout", { headers: { Origin: "https://evil.example" }, data: {} });
  expect(forbidden.status()).toBe(403);
  const malformed = await page.request.post("/api/auth/logout", { headers: { Origin: origin, "Content-Type": "application/json" }, data: "{" });
  expect(malformed.status()).toBe(400);
  expect((await context.cookies()).find(cookie => cookie.name === "sb_session")?.value).toBe(sessionCookie!.value);
  await expect(page.locator(".header-account-link")).toHaveText("Миний бүртгэл");

  const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === "/api/auth/logout" && response.request().method() === "POST");
  await page.getByRole("button", { name: "Гарах", exact: true }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  expect((await response.json()).revocationConfirmed).toBe(false);
  await page.waitForURL(url => url.pathname === "/login" && url.searchParams.get("logout") === "local");
  await expect(page.getByText("Энэ төхөөрөмжөөс гарлаа. Сервер дээрх нэвтрэх эрхийг цуцалсныг баталгаажуулж чадсангүй.", { exact: true })).toBeVisible();
  await expect(page.locator(".header-account-link")).toHaveText("Нэвтрэх");
  expect((await context.cookies()).some(cookie => cookie.name === "sb_session")).toBe(false);
  expect(await (await page.request.get("/api/auth/session")).json()).toEqual({ user: null });
  expect((await page.request.put("/api/shop/profile", { headers: { Origin: origin }, data: {} })).status()).toBe(401);
  expect((await request.get(`${mockApi}/api/v1/shop/profile`, { headers: { Authorization: `Bearer ${sessionCookie!.value}` } })).status()).toBe(200);
  await page.goto("/account");
  await page.waitForURL(url => url.pathname === "/login" && url.searchParams.get("next") === "/account");
});
