import "server-only";
import { cacheLife } from "next/cache";
import type { CatalogQuery } from "@/lib/catalog";
import { createShopApiClient } from "@/lib/shop-api-client";

export const defaultShopQuery: CatalogQuery = { q: "", category: "", tag: "", min: undefined, max: undefined, sort: "newest", page: 1 };

function client() {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new Error("API_BASE_URL is not configured");
  return createShopApiClient(baseUrl);
}

export async function getShopProducts(query: CatalogQuery = defaultShopQuery, perPage = 9) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 300 });
  return client().getProducts(query, perPage);
}

export async function getShopOptions() {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 300 });
  const [options, products] = await Promise.all([client().getOptions(), client().getProducts(defaultShopQuery, 1)]);
  return { ...options, total: products.total };
}

export async function getShopProduct(id: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 300 });
  return client().getProduct(id);
}

export async function getCartProducts(ids: string[]) {
  const products = [];
  for (let offset = 0; offset < ids.length; offset += 6) {
    const entries = await Promise.all(ids.slice(offset, offset + 6).map((id) => client().getProduct(id)));
    for (const entry of entries) if (entry) products.push(entry.product);
  }
  return products;
}
