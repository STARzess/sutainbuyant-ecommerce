export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  label: string;
  price: number;
  description?: string;
  image?: { url: string; thumbnail?: string; preview?: string };
  categoryId?: string;
  tagNames?: { id: string; name: string }[];
  sku: string;
  tags: string[];
  addedAt: string;
};

export const catalogSorts = [
  { id: "newest", name: "Шинээр нэмэгдсэн" },
  { id: "price-asc", name: "Үнэ: багаас их" },
  { id: "price-desc", name: "Үнэ: ихээс бага" },
  { id: "name-asc", name: "Нэр: А–Я" },
] as const;

export type CatalogSort = (typeof catalogSorts)[number]["id"];
export type CatalogQuery = {
  q: string;
  category: string;
  tag: string;
  min: number | undefined;
  max: number | undefined;
  sort: CatalogSort;
  page: number;
};
export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function price(value: string) {
  if (!/^\d+(\.\d+)?$/.test(value)) return undefined;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount <= 1_000_000_000
    ? amount
    : undefined;
}

export function parseCatalogQuery(params: SearchParams, options?: { categories: { id: string }[]; tags: { id: string }[] }): CatalogQuery {
  const category = first(params.category);
  const tag = first(params.tag);
  const sort = first(params.sort);
  const page = first(params.page);

  return {
    q: first(params.q).trim().slice(0, 120),
    category: (options ? options.categories.some((item) => item.id === category) : /^[1-9]\d{0,14}$/.test(category))
      ? category
      : "",
    tag: (options ? options.tags.some((item) => item.id === tag) : /^[1-9]\d{0,14}$/.test(tag)) ? tag : "",
    min: price(first(params.min)),
    max: price(first(params.max)),
    sort: catalogSorts.some((item) => item.id === sort)
      ? (sort as CatalogSort)
      : "newest",
    page:
      /^\d+$/.test(page) && Number.isSafeInteger(Number(page))
        ? Math.max(1, Number(page))
        : 1,
  };
}

export function catalogHref(
  query: CatalogQuery,
  changes: Partial<CatalogQuery> = {},
) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.tag) params.set("tag", next.tag);
  if (next.min !== undefined) params.set("min", String(next.min));
  if (next.max !== undefined) params.set("max", String(next.max));
  params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  return `/products?${params.toString()}`;
}

export function paginationPages(page: number, pages: number): (number | "ellipsis")[] {
  const visible = [...new Set([1, pages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pages))].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (const value of visible) {
    const previous = result.at(-1);
    if (typeof previous === "number" && value > previous + 1) result.push("ellipsis");
    result.push(value);
  }
  return result;
}
