// Agent Supply – tiny demo shop server for the Omnigent workshop.
// No dependencies, no build step:  node server.js  →  http://localhost:3000
//
// - serves the shop from ./public
// - mock API:  GET /api/products · POST /api/orders · GET /api/orders
// - live reload: the browser reloads by itself when a file in ./public or ./data changes

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cartTotals } from "./public/cart.js";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(ROOT, "public");
const DATA_DIR = join(ROOT, "data");
const PRODUCTS_FILE = join(DATA_DIR, "products.json");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const LIVE_RELOAD_SNIPPET =
  '<script>new EventSource("/__livereload").onmessage = () => location.reload();</script>';

/** Reads the mock products fresh on every request, so edits show up immediately. */
export async function loadProducts() {
  return JSON.parse(await readFile(PRODUCTS_FILE, "utf8"));
}

/** Creates the shop server (not listening yet). Orders are kept in memory only. */
export function createShopServer() {
  const orders = [];
  const reloadClients = new Set();

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/__livereload") return openLiveReload(res, reloadClients);
      if (url.pathname === "/api/products" && req.method === "GET") {
        return sendJson(res, 200, await loadProducts());
      }
      if (url.pathname === "/api/orders" && req.method === "POST") {
        return await createOrder(req, res, orders);
      }
      if (url.pathname === "/api/orders" && req.method === "GET") return sendJson(res, 200, orders);
      if (req.method === "GET") return await serveStatic(url.pathname, res);
      return sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  });

  server.notifyReload = () => {
    for (const client of reloadClients) client.write("data: reload\n\n");
  };
  return server;
}

async function createOrder(req, res, orders) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { error: "Body must be JSON." });
  }

  const { items, customer } = body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    return sendJson(res, 400, { error: "The cart is empty." });
  }
  if (!customer?.name?.trim() || !/^[^@\s]+@[^@\s]+$/.test(customer?.email ?? "")) {
    return sendJson(res, 400, { error: "Please enter a name and a valid email address." });
  }

  const products = await loadProducts();
  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product) return sendJson(res, 400, { error: `Unknown product: ${item.id}` });
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return sendJson(res, 400, { error: `Invalid quantity for ${item.id}` });
    }
    if (item.quantity > product.stock) {
      return sendJson(res, 409, { error: `Not enough stock for ${product.name}` });
    }
  }

  const totals = cartTotals(items, products);
  const order = {
    id: `ORD-${1001 + orders.length}`,
    customer: { name: customer.name.trim(), email: customer.email },
    items: items.map(({ id, quantity }) => ({ id, quantity })),
    netCents: totals.netCents,
    vatCents: totals.vatCents,
    grossCents: totals.grossCents,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return sendJson(res, 201, order);
}

async function serveStatic(pathname, res) {
  const relative = pathname === "/" ? "index.html" : normalize(pathname).replace(/^[/\\]+/, "");
  const filePath = join(PUBLIC_DIR, relative);
  if (!filePath.startsWith(PUBLIC_DIR)) return sendJson(res, 403, { error: "Forbidden" });

  let content;
  try {
    content = await readFile(filePath);
  } catch {
    return sendJson(res, 404, { error: "Not found" });
  }
  const type = CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream";
  if (type.startsWith("text/html")) {
    content = content.toString("utf8").replace("</body>", `${LIVE_RELOAD_SNIPPET}\n</body>`);
  }
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(content);
}

function openLiveReload(res, clients) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-store",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");
  clients.add(res);
  res.on("close", () => clients.delete(res));
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": CONTENT_TYPES[".json"], "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 100_000) reject(new Error("Body too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// Start the server only when run directly (`node server.js`), not when imported by tests.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createShopServer();
  server.listen(port, () => {
    console.log(`Agent Supply is running at http://localhost:${port}`);
    console.log("Live reload is on – edit files in public/ or data/ and the browser refreshes.");
  });

  let timer;
  const scheduleReload = () => {
    clearTimeout(timer);
    timer = setTimeout(() => server.notifyReload(), 150);
  };
  for (const dir of [PUBLIC_DIR, DATA_DIR]) watch(dir, { recursive: true }, scheduleReload);
}
