"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CART_STORAGE_KEY, parseCart, type CartItem } from "./cart";

const CART_CHANGE_EVENT = "sutainbuyant:cart-change";
type CartState = { items: CartItem[]; ready: boolean; storageAvailable: boolean };
const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({ items: [], ready: false, storageAvailable: true });
  useEffect(() => {
    function sync() {
      try { setCart({ items: parseCart(localStorage.getItem(CART_STORAGE_KEY)), ready: true, storageAvailable: true }); }
      catch { setCart({ items: [], ready: true, storageAvailable: false }); }
    }
    const onStorage = (event: StorageEvent) => { if (event.key === CART_STORAGE_KEY || event.key === null) sync(); };
    const timer = setTimeout(sync, 0);
    window.addEventListener("storage", onStorage); window.addEventListener(CART_CHANGE_EVENT, sync);
    return () => { clearTimeout(timer); window.removeEventListener("storage", onStorage); window.removeEventListener(CART_CHANGE_EVENT, sync); };
  }, []);
  return <CartContext value={cart}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartProvider is required");
  return context;
}

export function updateStoredCart(transform: (items: CartItem[]) => CartItem[]) {
  const next = transform(parseCart(localStorage.getItem(CART_STORAGE_KEY)));
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  return next;
}
