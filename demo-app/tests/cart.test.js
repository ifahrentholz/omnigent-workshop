import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addToCart,
  setQuantity,
  removeFromCart,
  cartCount,
  cartTotals,
  formatPrice,
} from "../public/cart.js";

const products = [
  { id: "mug", price_cents: 1000, vat: "standard" },
  { id: "book", price_cents: 1500, vat: "reduced" },
  { id: "cookie", price_cents: 50, vat: "standard" },
];

test("adding the same product twice increases its quantity", () => {
  const cart = addToCart(addToCart([], "mug"), "mug", 2);
  assert.deepEqual(cart, [{ id: "mug", quantity: 3 }]);
});

test("setting the quantity to zero removes the line", () => {
  const cart = setQuantity([{ id: "mug", quantity: 2 }], "mug", 0);
  assert.deepEqual(cart, []);
});

test("removeFromCart and cartCount", () => {
  const cart = removeFromCart(
    [
      { id: "mug", quantity: 2 },
      { id: "book", quantity: 1 },
    ],
    "mug",
  );
  assert.equal(cartCount(cart), 1);
});

test("empty cart totals are zero", () => {
  const { netCents, vatCents, grossCents } = cartTotals([], products);
  assert.deepEqual([netCents, vatCents, grossCents], [0, 0, 0]);
});

test("VAT is computed per rate", () => {
  const totals = cartTotals(
    [
      { id: "book", quantity: 1 },
      { id: "mug", quantity: 2 },
    ],
    products,
  );
  assert.equal(totals.netCents, 1500 + 2000);
  // 7 % of 15.00 = 1.05 ; 19 % of 20.00 = 3.80
  assert.equal(totals.vatCents, 105 + 380);
  assert.equal(totals.grossCents, 3500 + 485);
});

test("rounding is half up", () => {
  // 19 % of 0.50 = 0.095 -> 0.10
  assert.equal(cartTotals([{ id: "cookie", quantity: 1 }], products).vatCents, 10);
});

test("unknown products are rejected", () => {
  assert.throws(() => cartTotals([{ id: "nope", quantity: 1 }], products), /Unknown product/);
});

test("formatPrice", () => {
  assert.equal(formatPrice(1234), "€12.34");
  assert.equal(formatPrice(5), "€0.05");
  assert.equal(formatPrice(-250), "-€2.50");
});
