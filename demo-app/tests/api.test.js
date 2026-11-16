import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createShopServer } from "../server.js";

let server;
let baseUrl;

before(async () => {
  server = createShopServer();
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

const order = (body) =>
  fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test("GET /api/products returns the catalogue", async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  assert.equal(response.status, 200);
  const products = await response.json();
  assert.ok(products.length > 0);
});

test("GET / serves the shop with live reload", async () => {
  const html = await (await fetch(`${baseUrl}/`)).text();
  assert.match(html, /Agent Supply/);
  assert.match(html, /__livereload/);
});

test("POST /api/orders creates an order with totals", async () => {
  const response = await order({
    items: [{ id: "mugs-agent-fuel", quantity: 2 }],
    customer: { name: "Ada", email: "ada@example.com" },
  });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.match(created.id, /^ORD-\d+$/);
  assert.equal(created.netCents, 2400);
  assert.equal(created.vatCents, 456);
});

test("POST /api/orders rejects an empty cart and a bad email", async () => {
  assert.equal((await order({ items: [], customer: { name: "A", email: "a@b.c" } })).status, 400);
  const badEmail = await order({
    items: [{ id: "mugs-agent-fuel", quantity: 1 }],
    customer: { name: "A", email: "nope" },
  });
  assert.equal(badEmail.status, 400);
});

test("POST /api/orders rejects sold-out products", async () => {
  const response = await order({
    items: [{ id: "apparel-sandbox-cap", quantity: 1 }],
    customer: { name: "A", email: "a@b.c" },
  });
  assert.equal(response.status, 409);
});
