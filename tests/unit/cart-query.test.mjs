import { test } from "vitest";
import assert from "node:assert/strict";
import { parseCart, addCartItem, changeCartQuantity, removeCartItem, getCartSummary } from "../../src/lib/cart.ts";
import { parseCatalogQuery, catalogHref, paginationPages } from "../../src/lib/catalog.ts";

test("corrupt or forged stored cart data never becomes a negative or unsafe quantity", () => {
  assert.deepEqual(parseCart("broken JSON"), []);
  assert.deepEqual(parseCart(JSON.stringify([{ id: "24", quantity: 2 }, { id: "24", quantity: 200 }, { id: "../private", quantity: 1 }, { id: "2", quantity: -1 }, { id: 2, quantity: 3 }])), [{ id: "24", quantity: 99 }]);
});
test("cart changes preserve other products and reject invalid quantities", () => {
  const original = [{ id: "24", quantity: 2 }, { id: "23", quantity: 1 }];
  assert.deepEqual(addCartItem(original, "24", 2), [{ id: "24", quantity: 4 }, { id: "23", quantity: 1 }]);
  assert.deepEqual(changeCartQuantity(original, "24", 5), [{ id: "24", quantity: 5 }, { id: "23", quantity: 1 }]);
  assert.deepEqual(removeCartItem(original, "24"), [{ id: "23", quantity: 1 }]);
  assert.equal(original[0].quantity, 2);
  assert.throws(() => addCartItem(original, "24", 0)); assert.throws(() => changeCartQuantity(original, "24", Infinity));
});
test("missing products remain visibly unavailable and never create a false total", () => {
  const summary = getCartSummary([{ id: "24", quantity: 2 }, { id: "missing", quantity: 1 }], [{ id: "24", price: 24000 }]);
  assert.equal(summary.subtotal, 48000); assert.equal(summary.unavailableCount, 1);
});
test("URL parsing accepts API category IDs, bounds input, and rejects unknown options", () => {
  const result = parseCatalogQuery({ q: "  бүтээгдэхүүн  ", category: "3", tag: "2", min: "0", max: "50000", sort: "price-desc", page: "2" }, { categories: [{ id: "3" }], tags: [{ id: "2" }] });
  assert.equal(result.q, "бүтээгдэхүүн"); assert.equal(result.category, "3"); assert.equal(result.tag, "2");
  assert.equal(parseCatalogQuery({ category: "toyota", min: "-1", page: "Infinity" }).category, "");
  assert.equal(parseCatalogQuery({ category: "9" }, { categories: [], tags: [] }).category, "");
});
test("pagination links retain filters and reset page when a filter changes", () => {
  const query = parseCatalogQuery({ q: "цүнх", category: "3", tag: "2", min: "1000", max: "50000", page: "4" });
  const url = new URL(catalogHref(query, { page: 1, sort: "price-asc" }), "https://shop.example");
  for (const key of ["q", "category", "tag", "min", "max", "sort"]) assert.ok(url.searchParams.has(key));
  assert.equal(url.searchParams.has("page"), false); assert.deepEqual(paginationPages(5, 10), [1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
});
