---
name: checkout-check
description: Checks the mini checkout code against the house rules (integer cents, rounding, tests). Use when asked for a checkout check, a code check of the checkout, or the house rules.
---

# checkout-check

Check the mini checkout against our three house rules. Do not change anything.

1. **Integer cents:** Read `checkout/pricing.py`. All amounts must be `int` in cents.
   Look for `float(`, `/ 100` or decimal literals in calculations.
2. **Rounding:** Rounding happens only via `round_half_up_div`.
   Look for `round(` outside that function. The integer division `//` in
   `format_eur` only splits euros and cents for display – that is allowed.
3. **Tests:** Run `python3 -m unittest -q` and note the result.

Answer EXACTLY in this format:

```
CHECKOUT-CHECK
Integer cents:  ✅ | ❌  <evidence with file:line>
Rounding:       ✅ | ❌  <evidence with file:line>
Tests:          ✅ | ❌  <number of tests, result>
Verdict:        <one sentence>
```
