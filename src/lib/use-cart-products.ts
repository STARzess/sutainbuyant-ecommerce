"use client";

import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import type { CartItem } from "@/lib/cart";

export function useCartProducts(items: CartItem[]) {
  const ids = [...new Set(items.map((item) => item.id).filter((id) => /^[1-9]\d{0,14}$/.test(id)))].sort().join(",");
  const [result, setResult] = useState<{ key: string; products: CatalogProduct[]; error: boolean }>({ key: "", products: [], error: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    const list = ids.split(",");
    async function load() {
      try {
        const products: CatalogProduct[] = [];
        for (let start = 0; start < list.length; start += 50) {
          const response = await fetch(`/api/shop/cart-products?ids=${encodeURIComponent(list.slice(start, start + 50).join(","))}`, { cache: "no-store", signal: controller.signal });
          if (!response.ok) throw new Error("Cart products request failed");
          const body = await response.json();
          if (!Array.isArray(body.data)) throw new Error("Invalid cart products response");
          products.push(...body.data);
        }
        if (!controller.signal.aborted) setResult({ key: ids, products, error: false });
      } catch {
        if (!controller.signal.aborted) setResult({ key: ids, products: [], error: true });
      }
    }
    void load();
    return () => controller.abort();
  }, [ids, attempt]);

  return {
    products: ids && result.key === ids ? result.products : [],
    ready: !ids || result.key === ids,
    error: Boolean(ids && result.key === ids && result.error),
    retry: () => { setResult({ key: "", products: [], error: false }); setAttempt((value) => value + 1); },
  };
}
