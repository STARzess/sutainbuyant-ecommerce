import test from "node:test";
import assert from "node:assert/strict";
import { changeCartQuantity, getCartSummary, removeCartItem, parseCart } from "../src/lib/cart.ts";

test("changing a quantity preserves other products and never revives a removed item", () => {
  const original = [{ id: "brake-disc", quantity: 2 }, { id: "oil-filter", quantity: 3 }];
  const changed = changeCartQuantity(original, "brake-disc", 5);
  assert.deepEqual(changed, [{ id: "brake-disc", quantity: 5 }, { id: "oil-filter", quantity: 3 }]);
  assert.deepEqual(original, [{ id: "brake-disc", quantity: 2 }, { id: "oil-filter", quantity: 3 }]);
  assert.deepEqual(changeCartQuantity(changed, "missing", 1), changed);
  assert.deepEqual(parseCart(JSON.stringify(changed)), changed);
});

test("invalid quantity changes fail without removing or changing an item", () => {
  const original = [{ id: "brake-disc", quantity: 2 }];
  for (const quantity of [0, -1, 1.5, 100, NaN, Infinity]) {
    assert.throws(() => changeCartQuantity(original, "brake-disc", quantity), RangeError);
  }
  assert.deepEqual(original, [{ id: "brake-disc", quantity: 2 }]);
});

test("removing an item keeps other quantities and supports removing the last item", () => {
  const original = [{ id: "brake-disc", quantity: 4 }, { id: "oil-filter", quantity: 3 }];
  const removed = removeCartItem(original, "brake-disc");
  assert.deepEqual(removed, [{ id: "oil-filter", quantity: 3 }]);
  assert.deepEqual(removeCartItem(removed, "oil-filter"), []);
  assert.deepEqual(removeCartItem(removed, "missing"), removed);
  assert.equal(original.length, 2);
});

test("totals use current catalog prices and report unavailable stored products", () => {
  const stored = parseCart(JSON.stringify([
    { id: "brake-disc", quantity: 2, price: 1 },
    { id: "oil-filter", quantity: 3, price: 999999 },
    { id: "discontinued-part", quantity: 4 },
  ]));
  const products = [{ id: "brake-disc", price: 120000 }, { id: "oil-filter", price: 18000 }];
  assert.deepEqual(getCartSummary(stored, products), { productCount: 3, quantity: 9, subtotal: 294000, unavailableCount: 1 });
  assert.deepEqual(getCartSummary([], products), { productCount: 0, quantity: 0, subtotal: 0, unavailableCount: 0 });
  assert.equal(getCartSummary(stored, [{ id: "brake-disc", price: 125000 }, products[1]]).subtotal, 304000);
});
