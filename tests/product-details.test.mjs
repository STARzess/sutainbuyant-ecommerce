import test from "node:test";
import assert from "node:assert/strict";
import {
  getRelatedProducts,
  getCatalogReturnHref,
  getProductDescription,
} from "../src/lib/product-details.ts";
import { addCartItem, parseCart, MAX_CART_QUANTITY } from "../src/lib/cart.ts";

const part = (id, category, tags, addedAt = "2026-09-01") => ({
  id,
  category,
  tags,
  addedAt,
  name: id,
  label: "Toyota Prius",
  sku: id,
  price: 10000,
  kind: "brake",
});

test("related products exclude the current item and rank category before shared brand", () => {
  const selected = part("current", "Тоормосны систем", ["toyota"]);
  const products = [
    selected,
    part("brand", "Шүүлтүүр", ["toyota"]),
    part("category", "Тоормосны систем", ["lexus"]),
    part("both", "Тоормосны систем", ["toyota"]),
    part("unrelated", "Цахилгаан", ["honda"]),
  ];
  assert.deepEqual(
    getRelatedProducts(selected, products).map((item) => item.id),
    ["both", "category", "brand"],
  );
  assert.equal(getRelatedProducts(selected, products, 1).length, 1);
  assert.equal(products[0], selected);
});
test("universal tag alone does not make unrelated parts related", () => {
  assert.equal(
    getRelatedProducts(part("oil", "Тос", ["universal"]), [
      part("battery", "Цахилгаан", ["universal"]),
    ]).length,
    0,
  );
});
test("descriptions exist for all part kinds", () => {
  for (const kind of [
    "brake",
    "oil",
    "filter",
    "shock",
    "tire",
    "battery",
    "plug",
  ])
    assert.ok(
      getProductDescription({ ...part("item", "category", []), kind }).length >
        20,
    );
});
test("return link preserves filters, sorting and pagination while rejecting external destinations", () => {
  const from =
    "/products?q=Toyota&category=filters&tag=toyota&min=0&max=40000&sort=price-asc&page=2";
  assert.equal(getCatalogReturnHref(from), from);
  assert.equal(
    getCatalogReturnHref("/products?sort=newest&from=https://example.com"),
    "/products?sort=newest",
  );
  for (const unsafe of [
    undefined,
    "https://example.com",
    "//example.com/products",
    "/products/other",
    "javascript:alert(1)",
    "/products\\evil",
    "/products?x=\nfoo",
  ])
    assert.equal(getCatalogReturnHref(unsafe), "/products");
});
test("cart recovers from corrupt storage and sanitizes malformed items", () => {
  assert.deepEqual(parseCart("broken JSON"), []);
  assert.deepEqual(parseCart('{"items":[]}'), []);
  const stored = JSON.stringify([
    null,
    { id: "valid", quantity: 2 },
    { id: "valid", quantity: 3 },
    { id: "bad", quantity: -1 },
    { id: "bad2", quantity: 1.5 },
    { id: "<script>", quantity: 2 },
  ]);
  assert.deepEqual(parseCart(stored), [{ id: "valid", quantity: 5 }]);
});
test("adding the same product merges quantity and persists through JSON reload", () => {
  const original = [{ id: "first", quantity: 2 }];
  const added = addCartItem(original, "first", 3);
  assert.deepEqual(added, [{ id: "first", quantity: 5 }]);
  assert.deepEqual(original, [{ id: "first", quantity: 2 }]);
  assert.deepEqual(parseCart(JSON.stringify(addCartItem(added, "second", 2))), [
    { id: "first", quantity: 5 },
    { id: "second", quantity: 2 },
  ]);
});
test("cart quantities stay bounded and invalid additions cannot write a cart", () => {
  assert.equal(
    addCartItem([{ id: "first", quantity: 98 }], "first", 3)[0].quantity,
    MAX_CART_QUANTITY,
  );
  for (const quantity of [0, -1, 0.5, NaN, Infinity, 100])
    assert.throws(() => addCartItem([], "first", quantity), RangeError);
});
