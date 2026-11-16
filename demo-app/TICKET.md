# SHOP-42: Discount codes in the cart

**As** a shop owner **I want** to offer discount codes **so that** we can run promotions.

## Requirements

`cart_total(items, code=None)` takes an optional discount code.

| Code | Effect |
|---|---|
| `WORKSHOP10` | 10 % off every line (on the net amount, before VAT) |
| `FIX500` | 5.00 EUR off the net total |

## Acceptance criteria

1. Codes are case-insensitive (`workshop10` works).
2. Unknown code -> `ValueError` with a clear message.
3. Discounts are applied **before** VAT; VAT is computed on the discounted net amount.
4. `FIX500` is split across the VAT rates in proportion to their net share. A leftover cent from the split goes to the rate with the largest net share.
5. The net total never drops below 0 (a 3.00 EUR cart + `FIX500` = 0.00 EUR).
6. `Total` gets a field `discount_cents` (net discount, default 0).
7. Everything in integer cents, rounded half up (`round_half_up_div`).
8. Existing tests stay green; new tests cover every criterion.

Tests: `python3 -m unittest -v`
