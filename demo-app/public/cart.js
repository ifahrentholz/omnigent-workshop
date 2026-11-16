// Cart logic for Agent Supply. Shared by the browser, the server and the tests.
// All amounts are integer cents so there are no floating-point rounding errors.

/** VAT rates in percent. */
export const VAT_RATES = { standard: 19, reduced: 7 };

/** Integer division rounded half up (0.5 rounds up). Expects non-negative integers. */
export function roundHalfUpDiv(numerator, denominator) {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

/** Returns a new cart with `quantity` more of `productId`. A cart is a list of { id, quantity }. */
export function addToCart(cart, productId, quantity = 1) {
  const existing = cart.find((line) => line.id === productId);
  if (existing) {
    return cart.map((line) =>
      line.id === productId ? { ...line, quantity: line.quantity + quantity } : line,
    );
  }
  return [...cart, { id: productId, quantity }];
}

/** Returns a new cart with the quantity of `productId` set. Zero or less removes the line. */
export function setQuantity(cart, productId, quantity) {
  if (quantity <= 0) return removeFromCart(cart, productId);
  return cart.map((line) => (line.id === productId ? { ...line, quantity } : line));
}

/** Returns a new cart without `productId`. */
export function removeFromCart(cart, productId) {
  return cart.filter((line) => line.id !== productId);
}

/** Number of items in the cart (sum of quantities). */
export function cartCount(cart) {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * Net, VAT and gross total of a cart.
 *
 * VAT is computed per rate on that rate's net subtotal (not per line),
 * the way it is shown on an invoice.
 */
export function cartTotals(cart, products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const netByRate = {};
  const lines = cart.map((line) => {
    const product = byId.get(line.id);
    if (!product) throw new Error(`Unknown product: ${line.id}`);
    const lineNetCents = product.price_cents * line.quantity;
    netByRate[product.vat] = (netByRate[product.vat] ?? 0) + lineNetCents;
    return { product, quantity: line.quantity, lineNetCents };
  });

  const netCents = Object.values(netByRate).reduce((sum, net) => sum + net, 0);
  const vatCents = Object.entries(netByRate).reduce(
    (sum, [rate, net]) => sum + roundHalfUpDiv(net * VAT_RATES[rate], 100),
    0,
  );
  return { lines, netCents, vatCents, grossCents: netCents + vatCents };
}

/** 1234 -> "€12.34" */
export function formatPrice(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}€${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}
