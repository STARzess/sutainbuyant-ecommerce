import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { defaultShopQuery, getShopProducts } from "@/lib/shop-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const first = await getShopProducts(defaultShopQuery, 50);
  const pages = await Promise.all(Array.from({ length: first.pages - 1 }, (_, index) => getShopProducts({ ...defaultShopQuery, page: index + 2 }, 50)));
  return [{ url: base.href, changeFrequency: "daily", priority: 1 }, { url: new URL("/products", base).href, changeFrequency: "daily", priority: .9 }, ...[first, ...pages].flatMap(page => page.products.map(product => ({ url: new URL(`/products/${product.id}`, base).href, changeFrequency: "weekly" as const, priority: .7 })))];
}
