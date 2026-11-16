// House rules for the mock product data in data/products.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const products = JSON.parse(
  await readFile(new URL("../data/products.json", import.meta.url), "utf8"),
);

const CATEGORIES = ["stickers", "mugs", "apparel", "books", "stationery"];
const COLORS = ["#1B31FF", "#081235", "#9C73F3", "#A7FF71", "#F2A541", "#E4572E"];

test("ids are unique", () => {
  const ids = products.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

for (const product of products) {
  test(`product ${product.id} follows the house rules`, () => {
    assert.ok(CATEGORIES.includes(product.category), `unknown category ${product.category}`);
    assert.match(product.id, new RegExp(`^${product.category}-[a-z0-9]+(-[a-z0-9]+)*$`));
    assert.ok(product.name?.trim(), "name is required");
    assert.ok(product.description?.length <= 100, "description is at most 100 characters");
    assert.ok(Number.isInteger(product.price_cents) && product.price_cents > 0, "price in whole cents");
    assert.equal(product.vat, product.category === "books" ? "reduced" : "standard");
    assert.ok(Number.isInteger(product.stock) && product.stock >= 0, "stock is a whole number >= 0");
    assert.ok(COLORS.includes(product.color), `color must be one of ${COLORS.join(", ")}`);
  });
}
