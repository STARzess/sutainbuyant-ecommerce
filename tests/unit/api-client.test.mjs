import { test } from "vitest";
import assert from "node:assert/strict";
import { ApiError, createApiClient } from "../../src/lib/api-client.ts";
import { createShopApiClient } from "../../src/lib/shop-api-client.ts";

const base = "https://api.example/api/v1";
test("Requests", async () => {
  let called;
  const api = createApiClient(base, async (url, options) => { called = { url: String(url), options }; return Response.json({ ok: true }); });
  assert.deepEqual(await api.request("shop/categories"), { ok: true });
  assert.equal(called.url, `${base}/shop/categories`);
  assert.equal(called.options.cache, "no-store");
  assert.equal(called.options.redirect, "error");
  assert.equal(called.options.headers.Authorization, undefined);
  for (const route of ["https://evil.example/api/v1/login", "../login", "/login", "//evil.example/login", "shop/../../login", "\\evil.example"]) await assert.rejects(api.request(route), { status: 500 });
});
test("Configuration", () => {
  for (const url of ["bad-url", "http://api.example/api", "https://user:secret@api.example/api", "https://api.example/api?token=x", "https://api.example/api#secret"]) assert.throws(() => createApiClient(url), ApiError);
  assert.ok(createApiClient("http://127.0.0.1:4318/api/v1"));
});
test("Authentication", async () => {
  let options;
  const api = createApiClient(base, async (_url, init) => { options = init; return Response.json({ ok: true }); });
  await api.request("logout", { method: "POST", token: "1|test-only", data: { name: "Бат" } });
  assert.equal(options.method, "POST");
  assert.equal(options.headers.Authorization, "Bearer 1|test-only");
  assert.equal(options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(options.body), { name: "Бат" });
  await assert.rejects(api.request("logout", { token: "x\r\nInjected: yes" }), { status: 401 });
});
test("Errors", async () => {
  const api = createApiClient(base, async () => Response.json({ message: "private internal detail", errors: { email: ["The email is taken", 123], password: "invalid shape", "bad key": ["discard"] } }, { status: 422 }));
  await assert.rejects(api.request("register"), (error) => {
    assert.equal(error.status, 422);
    assert.deepEqual(error.errors, { email: ["The email is taken"] });
    assert.equal(error.message.includes("private"), false);
    return true;
  });
});
test("Responses", async () => {
  await assert.rejects(createApiClient(base, async () => { throw new Error("secret URL"); }).request("login"), { status: 503 });
  await assert.rejects(createApiClient(base, async () => new Response("not-json")).request("login"), { status: 502 });
  await assert.rejects(createApiClient(base, async () => Response.json([])).request("login"), { status: 502 });
  const missing = createApiClient(base, async () => new Response("not-json", { status: 404 }));
  assert.equal(await missing.request("shop/products/99", { allowMissing: true }), null);
  await assert.rejects(missing.request("shop/products/99"), { status: 404 });
});
test("Catalog", async () => {
  let url;
  const client = createShopApiClient(base, async (target) => {
    url = new URL(target);
    return Response.json({ data: [{ id: 12, name: "Бараа", price: 5500, categories: [], tags: [] }], meta: { total: 15, last_page: 2, current_page: 2, from: 10, to: 15 } });
  });
  const result = await client.getProducts({ q: "цай & кофе", category: "2", tag: "3", min: 0, max: 6000, sort: "price-asc", page: 2 });
  assert.deepEqual(Object.fromEntries(url.searchParams), { search: "цай & кофе", category_id: "2", tag_id: "3", min_price: "0", max_price: "6000", sort: "price_asc", page: "2", per_page: "9" });
  assert.equal(result.products[0].id, "12");
  assert.equal(result.total, 15);
  assert.equal(result.page, 2);
  assert.equal(result.pages, 2);
});
