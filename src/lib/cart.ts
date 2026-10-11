export type CartItem = { id: string; quantity: number };
export const CART_STORAGE_KEY = "sutainbuyant.cart.v1";
export const MAX_CART_QUANTITY = 99;

function validId(id: unknown): id is string {
  return typeof id === "string" && /^[a-z0-9][a-z0-9-]{0,119}$/.test(id);
}

export function parseCart(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const quantities = new Map<string, number>();
    for (const item of parsed) {
      if (
        !item ||
        typeof item !== "object" ||
        !validId(item.id) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      )
        continue;
      quantities.set(
        item.id,
        Math.min(
          MAX_CART_QUANTITY,
          (quantities.get(item.id) ?? 0) + item.quantity,
        ),
      );
    }
    return [...quantities].map(([id, quantity]) => ({ id, quantity }));
  } catch {
    return [];
  }
}

export function addCartItem(
  items: CartItem[],
  id: string,
  quantity: number,
): CartItem[] {
  if (
    !validId(id) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_CART_QUANTITY
  ) {
    throw new RangeError("Invalid cart item or quantity");
  }
  const next = parseCart(JSON.stringify(items));
  const existing = next.find((item) => item.id === id);
  if (existing)
    existing.quantity = Math.min(
      MAX_CART_QUANTITY,
      existing.quantity + quantity,
    );
  else next.push({ id, quantity });
  return next;
}
