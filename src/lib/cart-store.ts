"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CART_STORAGE_KEY, parseCart, type CartItem } from "@/lib/cart";

const CART_CHANGE_EVENT = "sutainbuyant:cart-change";
const STORAGE_UNAVAILABLE = Symbol("storage-unavailable");

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CART_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CART_CHANGE_EVENT, onChange);
  };
}

function snapshot() {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY) ?? "";
  } catch {
    return STORAGE_UNAVAILABLE;
  }
}

function serverSnapshot() {
  return null;
}

export function useCart() {
  const rawCart = useSyncExternalStore<string | typeof STORAGE_UNAVAILABLE | null>(subscribe, snapshot, serverSnapshot);
  const items = useMemo(
    () => parseCart(typeof rawCart === "string" ? rawCart : null),
    [rawCart],
  );
  return {
    items,
    ready: rawCart !== null,
    storageAvailable: rawCart !== STORAGE_UNAVAILABLE,
  };
}

export function updateStoredCart(transform: (items: CartItem[]) => CartItem[]) {
  const current = parseCart(window.localStorage.getItem(CART_STORAGE_KEY));
  const next = transform(current);
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  return next;
}
