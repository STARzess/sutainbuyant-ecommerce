import { test } from "vitest";
import assert from "node:assert/strict";
import { ApiError } from "../../src/lib/api-client.ts";
import { createOrdersApiClient, mapOrderSummary, sortOrdersNewest, canCancelOrder } from "../../src/lib/orders-api-client.ts";
const base = "https://api.example/api/v1";
const row = (id = 1, status = "pending", created_at = "2026-10-12T04:00:00Z") => ({ id, number: `ORD-${id}`, status, status_label: "upstream label", total: 7000, items_count: 2, created_at, customer_name: "private", customer_phone: "private", shipping_address: "private", token: "private" });

test("Orders", async () => {
  const api = createOrdersApiClient(base, async (url, options) => {
    assert.equal(String(url), `${base}/shop/orders`);
    assert.equal(options.method, "GET");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers.Authorization, "Bearer qa-only");
    return Response.json({ data: [row(1), row(2)] });
  });
  const result = await api.getOrders("qa-only");
  assert.deepEqual(result.map((order) => order.id), ["2", "1"]);
  assert.equal(result[0].statusLabel, "Хүлээгдэж буй");
  assert.equal(result[0].itemsCount, 2);
  for (const name of ["token", "customer_name", "customer_phone", "shipping_address"]) assert.equal(Object.hasOwn(result[0], name), false);
});
test("Sorting", () => {
  const orders = [mapOrderSummary(row(3, "paid", null)), mapOrderSummary(row(1, "pending", "2026-10-10T00:00:00Z")), mapOrderSummary(row(2))];
  assert.deepEqual(sortOrdersNewest(orders).map((item) => item.id), ["2", "1", "3"]);
  assert.equal(orders[0].id, "3");
  assert.equal(mapOrderSummary({ ...row(), items_count: undefined }).itemsCount, undefined);
});
test("Responses", async () => {
  assert.deepEqual(await createOrdersApiClient(base, async () => Response.json({ data: [] })).getOrders("qa"), []);
  for (const data of [null, [row(), row()], [{ ...row(), status: "constructor" }], [{ ...row(), items_count: -1 }], [{ ...row(), total: "7000" }]]) await assert.rejects(createOrdersApiClient(base, async () => Response.json({ data })).getOrders("qa"), ApiError);
});
test("Cancellation", () => {
  assert.equal(canCancelOrder("pending"), true);
  for (const status of ["paid", "shipped", "completed", "cancelled"]) assert.equal(canCancelOrder(status), false);
});
test("Request", async () => {
  const api = createOrdersApiClient(base, async (url, options) => {
    assert.equal(String(url), `${base}/shop/orders/1/cancel`);
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer qa-only");
    assert.equal(options.body, undefined);
    return Response.json({ data: row(1, "cancelled") });
  });
  assert.deepEqual(await api.cancelOrder("qa-only", "1"), { id: "1", status: "cancelled" });
});
test("Validation", async () => {
  let calls = 0;
  const api = createOrdersApiClient(base, async () => { calls++; return Response.json({ data: row(1, "pending") }); });
  for (const id of ["../profile", "0", "01", "abc", "9007199254740992"]) await assert.rejects(api.cancelOrder("qa", id), { status: 400 });
  assert.equal(calls, 0);
  await assert.rejects(api.cancelOrder("qa", "1"), { status: 502 });
  await assert.rejects(createOrdersApiClient(base, async () => Response.json({ data: row(2, "cancelled") })).cancelOrder("qa", "1"), { status: 502 });
});
test("Errors", async () => {
  for (const status of [401, 403, 404, 409, 422, 503]) {
    const api = createOrdersApiClient(base, async () => Response.json({ message: "private" }, { status }));
    await assert.rejects(api.getOrders("qa"), { status });
    await assert.rejects(api.cancelOrder("qa", "1"), { status });
  }
});
