import { test } from "vitest";
import assert from "node:assert/strict";
import { validateCheckout, checkoutFieldErrors, subtractPurchasedItems } from "../../src/lib/checkout.ts";
import { createOrdersApiClient, mapCustomerOrder, formatOrderDate } from "../../src/lib/orders-api-client.ts";

const base = "https://shop.example/api/v1";
const values = { customer_name: "Бат", customer_phone: "+976 9911 2233", shipping_address: "БЗД, 1-р хороо, 12-р байр, 34 тоот", note: null, items: [{ product_id: 1, quantity: 2 }] };
const order = (id = 10) => ({ id, number: "ORD-10", status: "pending", status_label: "Хүлээгдэж буй", total: 7000, customer_name: "Бат", customer_phone: "99112233", shipping_address: "Хаяг", note: null, created_at: "2026-10-12T04:00:00Z", items: [{ id: 12, product_id: 1, product_name: "Бүтээгдэхүүн", unit_price: 3500, quantity: 2, line_total: 7000, image: { url: "https://shop.example/storage/photo.png" } }] });

test("Validation", () => {
  const result = validateCheckout({ ...values, customer_name: " Бат ", note: " хүргэлтийн тэмдэглэл ", total: 1, user_id: 999, items: [{ product_id: 1, quantity: 2, price: 1, line_total: 2 }] });
  assert.equal(result.valid, true);
  assert.equal(result.values.customer_name, "Бат");
  assert.equal(result.values.note, "хүргэлтийн тэмдэглэл");
  assert.equal(result.values.total, undefined);
  assert.equal(result.values.user_id, undefined);
  assert.deepEqual(result.values.items, [{ product_id: 1, quantity: 2 }]);
});
test("Fields", () => {
  assert.deepEqual(Object.keys(validateCheckout({}).errors).sort(), ["customer_name", "customer_phone", "items", "shipping_address"]);
  for (const phone of ["        ", "--------", "123", "abcd12345678", "+976<script>"]) assert.ok(validateCheckout({ ...values, customer_phone: phone }).errors.customer_phone);
  assert.ok(validateCheckout({ ...values, customer_name: "x".repeat(101) }).errors.customer_name);
  assert.ok(validateCheckout({ ...values, shipping_address: "x".repeat(501) }).errors.shipping_address);
  assert.ok(validateCheckout({ ...values, note: "x".repeat(1001) }).errors.note);
});
test("Items", () => {
  for (const product_id of ["1", null, true, -1, 0, Number.MAX_SAFE_INTEGER + 1]) assert.ok(validateCheckout({ ...values, items: [{ product_id, quantity: 1 }] }).errors["items.0.product_id"]);
  for (const quantity of ["1", null, 0, -1, 1.5, 101]) assert.ok(validateCheckout({ ...values, items: [{ product_id: 1, quantity }] }).errors["items.0.quantity"]);
  assert.ok(validateCheckout({ ...values, items: [values.items[0], values.items[0]] }).errors["items.1.product_id"]);
  assert.ok(validateCheckout({ ...values, items: Array.from({ length: 51 }, (_, index) => ({ product_id: index + 1, quantity: 1 })) }).errors.items);
  assert.equal(validateCheckout({ ...values, items: [{ product_id: 1, quantity: 100 }] }).valid, true);
});
test("Errors", () => {
  const errors = checkoutFieldErrors({ customer_phone: ["private phone"], "items.0.product_id": ["private SQL"], "items.1.quantity": ["private"], admin: ["private"], constructor: ["private"] });
  assert.equal(errors.customer_phone[0], "Утасны дугаараа зөв оруулна уу.");
  assert.ok(errors["items.0.product_id"]);
  assert.ok(errors["items.1.quantity"]);
  assert.equal(errors.admin, undefined);
  assert.equal(Object.hasOwn(errors, "constructor"), false);
  assert.equal(JSON.stringify(errors).includes("private"), false);
});
test("Cleanup", () => {
  const purchased = [{ id: "1", quantity: 2 }, { id: "2", quantity: 1 }];
  assert.deepEqual(subtractPurchasedItems(purchased, purchased), []);
  const current = [{ id: "1", quantity: 4 }, { id: "2", quantity: 1 }, { id: "3", quantity: 5 }];
  assert.deepEqual(subtractPurchasedItems(current, purchased), [{ id: "1", quantity: 2 }, { id: "3", quantity: 5 }]);
  assert.equal(current[0].quantity, 4);
  assert.deepEqual(subtractPurchasedItems([], purchased), []);
});
test("Checkout", async () => {
  let requested;
  const client = createOrdersApiClient(base, async (url, options) => { requested = { url: String(url), options }; return Response.json({ data: order() }, { status: 201 }); });
  assert.deepEqual(await client.createOrder("qa-only-token", { ...values, total: 1, user_id: 2, items: [{ product_id: 1, quantity: 2, price: 1 }] }), { id: "10" });
  assert.equal(requested.url, `${base}/shop/orders`);
  assert.equal(requested.options.method, "POST");
  assert.equal(requested.options.headers.Authorization, "Bearer qa-only-token");
  assert.equal(requested.options.cache, "no-store");
  assert.deepEqual(JSON.parse(requested.options.body), values);
});
test("Details", async () => {
  const client = createOrdersApiClient(base, async (url, options) => {
    assert.equal(String(url), `${base}/shop/orders/10`);
    assert.equal(options.headers.Authorization, "Bearer qa-only-token");
    return Response.json({ data: order() });
  });
  const mapped = await client.getOrder("qa-only-token", "10");
  assert.equal(mapped.total, 7000);
  assert.equal(mapped.items[0].unitPrice, 3500);
  assert.equal(mapped.statusLabel, "Хүлээгдэж буй");
  assert.equal(mapped.items[0].image.url, "https://shop.example/storage/photo.png");
  const deleted = mapCustomerOrder({ ...order(), items: [{ ...order().items[0], product_id: null, image: { url: "https://evil.example/storage/photo.png" } }] }, base);
  assert.equal(deleted.items[0].productId, null);
  assert.equal(deleted.items[0].image, undefined);
});
test("Authorization", async () => {
  let count = 0;
  const client = createOrdersApiClient(base, async () => { count++; return Response.json({}, { status: 404 }); });
  for (const id of ["../profile", "0", "abc", "01", "9007199254740992"]) assert.equal(await client.getOrder("qa", id), null);
  assert.equal(count, 0);
  for (const status of [403, 404, 401, 503]) {
    const client = createOrdersApiClient(base, async () => Response.json({}, { status }));
    if ([403, 404].includes(status)) assert.equal(await client.getOrder("qa", "10"), null);
    else await assert.rejects(client.getOrder("qa", "10"), { status });
  }
});
test("Responses", async () => {
  for (const changes of [{ status: "private-admin-status" }, { total: -1 }, { total: "7000" }, { items: null }, { items: [{ ...order().items[0], quantity: 0 }] }]) assert.throws(() => mapCustomerOrder({ ...order(), ...changes }, base), { status: 502 });
  const wrong = createOrdersApiClient(base, async () => Response.json({ data: order(11) }));
  await assert.rejects(wrong.getOrder("qa", "10"), { status: 502 });
});
test("Dates", () => {
  assert.equal(formatOrderDate(null), "Огноо тодорхойгүй");
  assert.equal(formatOrderDate("invalid"), "Огноо тодорхойгүй");
  assert.ok(formatOrderDate("2026-10-12T04:00:00Z").includes("12:00"));
});
