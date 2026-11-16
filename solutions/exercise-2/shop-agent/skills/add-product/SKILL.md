---
name: add-product
description: Adds new products to the Agent Supply shop following the house rules. Use when asked to add, create or stock new products in the shop.
---

# add-product

Add the requested products to `data/products.json` (append at the end, keep the
2-space indentation). Do not change existing products.

House rules for every new product:

| Field | Rule |
|---|---|
| `id` | `<category>-<name-in-kebab-case>`, unique |
| `category` | one of `stickers`, `mugs`, `apparel`, `books`, `stationery` – never invent a new one |
| `name` | short, English |
| `description` | English, at most 100 characters |
| `price_cents` | whole cents, e.g. `2490` = €24.90 |
| `vat` | `"reduced"` for books, otherwise `"standard"` |
| `stock` | whole number ≥ 0, default `25` |
| `color` | one of `#1B31FF` `#081235` `#9C73F3` `#A7FF71` `#F2A541` `#E4572E` |

Then run `node --test`. `tests/products.test.js` checks these rules – fix the data until all tests pass.

Answer EXACTLY in this format:

```
PRODUCT ADDED
<id> · <name> · <price as €0.00> · stock <n>
Tests: ✅ <n> passed | ❌ <what failed>
Open http://localhost:3000 – the shop reloads by itself.
```
