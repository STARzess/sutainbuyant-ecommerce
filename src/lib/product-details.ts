import type { CatalogProduct } from "./catalog";

export function getProductDescription(product: CatalogProduct) {
  return product.description ?? "";
}

export function getCatalogReturnHref(value: string | string[] | undefined) {
  const from = Array.isArray(value) ? value[0] : value;
  if (
    !from ||
    from.length > 2000 ||
    !/^\/products(?:\?|$)/.test(from) ||
    /[\\\r\n]/.test(from)
  )
    return "/products";
  try {
    const url = new URL(from, "https://local.invalid");
    if (url.origin !== "https://local.invalid" || url.pathname !== "/products")
      return "/products";
    const allowedKeys = new Set([
      "q",
      "category",
      "tag",
      "min",
      "max",
      "sort",
      "page",
    ]);
    for (const key of [...url.searchParams.keys()]) {
      if (!allowedKeys.has(key)) url.searchParams.delete(key);
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return "/products";
  }
}
