import type { CatalogProduct, CatalogQuery } from "./catalog";

export type ShopOption = {
  id: string;
  name: string;
  description?: string;
  image?: CatalogProduct["image"];
  count?: number;
};

export class ShopApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super("Shop API request failed");
    this.name = "ShopApiError";
    this.status = status;
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ShopApiError(502);
  return value as Record<string, unknown>;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function identifier(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || !/^\d+$/.test(String(value))) throw new ShopApiError(502);
  return String(number);
}

function integer(value: unknown, minimum: number) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new ShopApiError(502);
  return value;
}

function imageUrl(value: unknown, baseUrl: string) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const base = new URL(baseUrl);
    const url = new URL(value, base.origin);
    return url.origin === base.origin && !url.username && !url.password && /^https?:$/.test(url.protocol) && url.pathname.startsWith("/storage/") ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function image(value: unknown, baseUrl: string): CatalogProduct["image"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const url = imageUrl(source.url, baseUrl);
  if (!url) return undefined;
  return { url, thumbnail: imageUrl(source.thumbnail, baseUrl), preview: imageUrl(source.preview, baseUrl) };
}

export function mapShopOption(value: unknown, baseUrl: string): ShopOption {
  const option = record(value);
  const id = identifier(option.id);
  return {
    id,
    name: text(option.name) || id,
    description: text(option.description),
    image: image(option.image, baseUrl),
    count: option.products_count === undefined ? undefined : integer(option.products_count, 0),
  };
}

export function mapShopProduct(value: unknown, baseUrl: string): CatalogProduct {
  const product = record(value);
  const id = identifier(product.id);
  if (typeof product.price !== "number" || !Number.isFinite(product.price) || product.price < 0) throw new ShopApiError(502);
  const categories = Array.isArray(product.categories) ? product.categories.map((item) => mapShopOption(item, baseUrl)) : [];
  const tags = Array.isArray(product.tags) ? product.tags.map((item) => mapShopOption(item, baseUrl)) : [];
  return {
    id,
    name: text(product.name) || `Бүтээгдэхүүн ${id}`,
    price: product.price,
    description: text(product.description),
    image: image(product.image, baseUrl),
    category: categories.map((item) => item.name).join(" · "),
    categoryId: categories[0]?.id,
    label: tags.map((item) => item.name).join(" · "),
    sku: text(product.sku) || id,
    tags: tags.map((item) => item.id),
    tagNames: tags.map(({ id, name }) => ({ id, name })),
    addedAt: text(product.created_at),
  };
}

const sorts = { newest: "newest", "price-asc": "price_asc", "price-desc": "price_desc", "name-asc": "name" } as const;

export function shopProductQuery(query: CatalogQuery, perPage = 9) {
  const params = new URLSearchParams();
  if (query.q) params.set("search", query.q);
  if (query.category) params.set("category_id", query.category);
  if (query.tag) params.set("tag_id", query.tag);
  if (query.min !== undefined) params.set("min_price", String(query.min));
  if (query.max !== undefined) params.set("max_price", String(query.max));
  params.set("sort", sorts[query.sort]);
  params.set("page", String(query.page));
  params.set("per_page", String(Math.max(1, Math.min(50, perPage))));
  return params;
}

export function createShopApiClient(baseUrl: string, fetcher: typeof fetch = fetch, timeoutMs = 10000) {
  const base = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (!/^https?:$/.test(base.protocol) || base.username || base.password || base.search || base.hash) throw new ShopApiError(500);

  async function request(route: string, allowMissing = false) {
    let response: Response;
    try {
      response = await fetcher(new URL(`shop/${route}`, base), {
        headers: { Accept: "application/json" },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new ShopApiError(503);
    }
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) throw new ShopApiError(response.status);
    try {
      return record(await response.json());
    } catch {
      throw new ShopApiError(502);
    }
  }

  function dataArray(body: Record<string, unknown> | null) {
    if (!body || !Array.isArray(body.data)) throw new ShopApiError(502);
    return body.data;
  }

  return {
    async getOptions() {
      const [categories, tags] = await Promise.all([request("categories"), request("tags")]);
      return {
        categories: dataArray(categories).map((item) => mapShopOption(item, base.href)),
        tags: dataArray(tags).map((item) => mapShopOption(item, base.href)),
      };
    },
    async getProducts(query: CatalogQuery, perPage = 9) {
      const invalidPriceRange = query.min !== undefined && query.max !== undefined && query.min > query.max;
      if (invalidPriceRange) return { products: [] as CatalogProduct[], total: 0, pages: 1, page: 1, start: 0, end: 0, invalidPriceRange };
      const body = await request(`products?${shopProductQuery(query, perPage)}`);
      const products = dataArray(body).map((item) => mapShopProduct(item, base.href));
      const meta = record(body!.meta);
      const total = integer(meta.total, 0);
      const pages = Math.max(1, integer(meta.last_page, 1));
      const page = Math.min(integer(meta.current_page, 1), pages);
      const start = meta.from === null ? 0 : integer(meta.from, 1);
      const end = meta.to === null ? 0 : integer(meta.to, 1);
      return { products, total, pages, page, start, end, invalidPriceRange };
    },
    async getProduct(id: string) {
      if (!/^[1-9]\d{0,14}$/.test(id) || !Number.isSafeInteger(Number(id))) return null;
      const body = await request(`products/${id}`, true);
      if (!body) return null;
      const product = mapShopProduct(body.data, base.href);
      if (product.id !== id || !Array.isArray(body.related)) throw new ShopApiError(502);
      const seen = new Set([id]);
      const related = body.related.map((item) => mapShopProduct(item, base.href)).filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }).slice(0, 4);
      return { product, related };
    },
  };
}
