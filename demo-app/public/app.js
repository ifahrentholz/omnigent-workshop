// Agent Supply – shop UI. Plain ES modules, no framework.
import {
  addToCart,
  setQuantity,
  removeFromCart,
  cartCount,
  cartTotals,
  formatPrice,
} from "./cart.js";

const CART_KEY = "agent-supply-cart";

const state = {
  products: [],
  cart: loadCart(),
  query: "",
  category: "",
  sort: "name",
};

const el = (id) => document.getElementById(id);

init();

async function init() {
  const response = await fetch("/api/products");
  state.products = await response.json();
  // Drop cart lines whose product no longer exists (e.g. after editing products.json).
  state.cart = state.cart.filter((line) => state.products.some((p) => p.id === line.id));

  fillCategories();
  el("search").addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderProducts();
  });
  el("category").addEventListener("change", (event) => {
    state.category = event.target.value;
    renderProducts();
  });
  el("sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });
  el("checkout").addEventListener("submit", placeOrder);

  renderProducts();
  renderCart();
}

function fillCategories() {
  const categories = [...new Set(state.products.map((p) => p.category))].sort();
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = capitalize(category);
    el("category").append(option);
  }
}

function visibleProducts() {
  const filtered = state.products.filter((product) => {
    const matchesCategory = !state.category || product.category === state.category;
    const text = `${product.name} ${product.description}`.toLowerCase();
    return matchesCategory && text.includes(state.query);
  });
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name),
    "price-asc": (a, b) => a.price_cents - b.price_cents,
    "price-desc": (a, b) => b.price_cents - a.price_cents,
  };
  return filtered.sort(sorters[state.sort]);
}

function renderProducts() {
  const products = visibleProducts();
  el("result-count").textContent = `${products.length} of ${state.products.length} products`;
  el("products").replaceChildren(...products.map(productCard));
}

function productCard(product) {
  const item = document.createElement("li");
  item.className = "product";
  item.innerHTML = `
    <div class="product-tile" style="--tile:${product.color}" aria-hidden="true">${initials(product.name)}</div>
    <div class="product-body">
      <p class="product-category">${capitalize(product.category)}</p>
      <h3 class="product-name"></h3>
      <p class="product-description"></p>
      <div class="product-footer">
        <span class="product-price">${formatPrice(product.price_cents)}</span>
        <button type="button" class="button">Add to cart</button>
      </div>
    </div>`;
  item.querySelector(".product-name").textContent = product.name;
  item.querySelector(".product-description").textContent = product.description;
  item.querySelector("button").addEventListener("click", () => {
    updateCart(addToCart(state.cart, product.id));
  });
  return item;
}

function renderCart() {
  const { lines, netCents, vatCents, grossCents } = cartTotals(state.cart, state.products);
  el("cart-count").textContent = cartCount(state.cart);
  el("cart-empty").hidden = lines.length > 0;
  el("cart-totals").hidden = lines.length === 0;
  el("checkout").hidden = lines.length === 0;

  el("cart-lines").replaceChildren(
    ...lines.map(({ product, quantity, lineNetCents }) => {
      const line = document.createElement("li");
      line.className = "cart-line";
      line.innerHTML = `
        <span class="cart-line-name"></span>
        <div class="stepper">
          <button type="button" class="step" data-delta="-1" aria-label="Decrease quantity">−</button>
          <span class="qty">${quantity}</span>
          <button type="button" class="step" data-delta="1" aria-label="Increase quantity">+</button>
        </div>
        <span class="cart-line-price">${formatPrice(lineNetCents)}</span>
        <button type="button" class="remove">×</button>`;
      line.querySelector(".cart-line-name").textContent = product.name;
      for (const button of line.querySelectorAll(".step")) {
        button.addEventListener("click", () => {
          const next = quantity + Number(button.dataset.delta);
          updateCart(setQuantity(state.cart, product.id, next));
        });
      }
      line.querySelector(".remove").addEventListener("click", () => {
        updateCart(removeFromCart(state.cart, product.id));
      });
      return line;
    }),
  );

  el("total-net").textContent = formatPrice(netCents);
  el("total-vat").textContent = formatPrice(vatCents);
  el("total-gross").textContent = formatPrice(grossCents);
}

async function placeOrder(event) {
  event.preventDefault();
  const message = el("checkout-message");
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: state.cart,
      customer: { name: el("customer-name").value, email: el("customer-email").value },
    }),
  });
  const result = await response.json();
  if (!response.ok) {
    message.textContent = result.error;
    message.className = "message error";
    return;
  }
  updateCart([]);
  el("checkout").reset();
  el("checkout").hidden = false;
  message.textContent = `Thank you! Order ${result.id} – ${formatPrice(result.grossCents)}.`;
  message.className = "message success";
}

function updateCart(cart) {
  state.cart = cart;
  saveCart(cart);
  renderCart();
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Storage may be unavailable (private mode) – the cart then lives only in memory.
  }
}

function initials(name) {
  return name
    .replace(/[“”"]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
