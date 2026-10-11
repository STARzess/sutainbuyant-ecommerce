import type { PartKind } from "./home-products";

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  label: string;
  price: number;
  kind: PartKind;
  sku: string;
  tags: string[];
  addedAt: string;
};

export const catalogCategories = [
  { id: "engine", name: "Хөдөлгүүр" },
  { id: "brakes", name: "Тоормосны систем" },
  { id: "suspension", name: "Явах эд анги" },
  { id: "oil", name: "Тос, тосолгоо" },
  { id: "filters", name: "Шүүлтүүр" },
  { id: "wheels", name: "Дугуй, обуд" },
  { id: "electrical", name: "Цахилгаан" },
] as const;

export const catalogTags = [
  { id: "toyota", name: "Toyota" },
  { id: "nissan", name: "Nissan" },
  { id: "lexus", name: "Lexus" },
  { id: "honda", name: "Honda" },
  { id: "hyundai", name: "Hyundai" },
  { id: "universal", name: "Универсал" },
] as const;

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
export const PAGE_SIZE = 9;

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

export function parseCatalogQuery(params: SearchParams): CatalogQuery {
  const category = first(params.category);
  const tag = first(params.tag);
  const sort = first(params.sort);
  const page = first(params.page);

  return {
    q: first(params.q).trim().slice(0, 120),
    category: catalogCategories.some((item) => item.id === category)
      ? category
      : "",
    tag: catalogTags.some((item) => item.id === tag) ? tag : "",
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

export function getCatalogPage(
  products: CatalogProduct[],
  query: CatalogQuery,
) {
  const category = catalogCategories.find((item) => item.id === query.category);
  const terms = query.q
    .toLocaleLowerCase("mn-MN")
    .normalize("NFKC")
    .split(/\s+/)
    .filter(Boolean);
  const invalidPriceRange =
    query.min !== undefined && query.max !== undefined && query.min > query.max;

  const filtered = products.filter((product) => {
    const searchable = [
      product.name,
      product.label,
      product.sku,
      product.category,
      ...product.tags.map(
        (tag) => catalogTags.find((item) => item.id === tag)?.name ?? tag,
      ),
    ]
      .join(" ")
      .toLocaleLowerCase("mn-MN")
      .normalize("NFKC");
    return (
      !invalidPriceRange &&
      terms.every((term) => searchable.includes(term)) &&
      (!category || product.category === category.name) &&
      (!query.tag || product.tags.includes(query.tag)) &&
      (query.min === undefined || product.price >= query.min) &&
      (query.max === undefined || product.price <= query.max)
    );
  });

  filtered.sort((a, b) => {
    const order =
      query.sort === "price-asc"
        ? a.price - b.price
        : query.sort === "price-desc"
          ? b.price - a.price
          : query.sort === "name-asc"
            ? a.name.localeCompare(b.name, "mn-MN")
            : b.addedAt.localeCompare(a.addedAt);
    return order || a.id.localeCompare(b.id);
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  return {
    products: filtered.slice(start, start + PAGE_SIZE),
    total,
    pages,
    page,
    start: total ? start + 1 : 0,
    end: Math.min(start + PAGE_SIZE, total),
    invalidPriceRange,
  };
}
