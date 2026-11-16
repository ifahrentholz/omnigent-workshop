# SHOP-42: Discount codes in the cart

**As** a shop owner **I want** to offer discount codes **so that** we can run promotions.

## Requirements

`cartTotals(cart, products, code)` in `public/cart.js` takes an optional discount code,
and the cart in the shop gets a field to enter it.

| Code | Effect |
|---|---|
| `WORKSHOP10` | 10 % off every line (on the net amount, before VAT) |
| `FIX500` | €5.00 off the net total |

## Acceptance criteria

1. Codes are case-insensitive (`workshop10` works).
2. Unknown code -> error with a clear message, shown in the cart.
3. Discounts are applied **before** VAT; VAT is computed on the discounted net amount.
4. `FIX500` is split across the VAT rates in proportion to their net share. A leftover cent from the split goes to the rate with the largest net share.
5. The net total never drops below 0 (a €3.00 cart + `FIX500` = €0.00).
6. The totals get a field `discountCents` (net discount, default 0); the cart shows a "Discount" line.
7. Everything in integer cents, rounded half up (`roundHalfUpDiv`).
8. `POST /api/orders` accepts the code and computes the same totals on the server.
9. Existing tests stay green; new tests cover every criterion.

Tests: `node --test`
