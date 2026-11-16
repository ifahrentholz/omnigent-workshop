---
name: test-gaps
description: Finds missing test cases for the mini checkout. Use when asked about test gaps, missing tests or a review of the tests.
---

# test-gaps

1. Read `checkout/pricing.py` and `tests/test_pricing.py`.
2. List every public function and check which edge cases are tested.
3. Pay special attention to: quantity 0, price 0, very large amounts, unknown
   VAT rate, rounding exactly at .5 cent, empty cart.

Answer EXACTLY in this format (at most 5 gaps, most important first):

```
TEST GAPS
1. <function>: <missing case> – <why it matters>
2. ...
Recommendation: <one sentence>
```
