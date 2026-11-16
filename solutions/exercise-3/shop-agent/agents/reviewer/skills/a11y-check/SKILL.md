---
name: a11y-check
description: Reviews the Agent Supply shop for accessibility problems (labels, button names, contrast, keyboard, language). Use when asked for an accessibility, a11y or WCAG review of the shop.
---

# a11y-check

Read `public/index.html`, `public/app.js`, `public/style.css` and the product
colours in `data/products.json`. Do not change anything.

Check:

1. Every form control has a visible label or an accessible name.
2. Every button says what it does – no lone symbols like `×` without an `aria-label`.
3. Text contrast is at least 4.5:1 (colours in `style.css`, and white text on the
   product tile colours from `data/products.json`).
4. The page has a `lang`, headings in order, and a visible keyboard focus.
5. Status messages are announced (`role="status"` or `aria-live`).

Answer EXACTLY in this format (at most 5 findings, most severe first):

```
A11Y-CHECK
1. [high|medium|low] <file:line> – <problem> – <fix>
2. ...
Verdict: <one sentence>
```
