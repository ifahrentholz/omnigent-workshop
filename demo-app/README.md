# Agent Supply

A tiny demo shop (merch for people who ship with agents) as a playground for the Omnigent workshop.
Mock data only – nothing is really sold. No dependencies, no build step, just Node 22+.

```bash
node server.js          # → http://localhost:3000  (PORT=4000 node server.js for another port)
node --test             # tests: cart logic, product house rules, mock API
```

| Path | What it is |
|---|---|
| `server.js` | Serves the shop, mock API (`GET /api/products`, `POST /api/orders`), live reload |
| `public/` | The shop: `index.html`, `app.js` (UI), `cart.js` (cart and VAT logic), `style.css` |
| `data/products.json` | Mock products – edit it and the browser reloads by itself |
| `tests/` | `node --test` |

Open ticket: [TICKET.md](TICKET.md)
