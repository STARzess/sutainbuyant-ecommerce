import type { CatalogProduct } from "./catalog";
import type { PartKind } from "./home-products";

const descriptions: Record<PartKind, string> = {
  brake:
    "Автомашины тоормосны системд зориулсан диск. Сэлбэгийн код болон автомашиныхаа загварыг тулгаж сонгоорой.",
  oil: "Автомашины тос, тосолгооны бүтээгдэхүүн. Тосны төрөл, зуурамтгай чанар, савлагааг автомашиныхаа шаардлагатай тулгаж сонгоорой.",
  filter:
    "Автомашины шүүлтүүр. Шүүлтүүрийн төрөл, хэмжээ болон сэлбэгийн кодыг тулгаж сонгоорой.",
  shock:
    "Автомашины явах эд ангийн амортизатор. Байрлал, загвар болон сэлбэгийн кодыг тулгаж сонгоорой.",
  tire: "Автомашины дугуй. Дугуйн хэмжээ болон улирлын зориулалтыг автомашиныхаа шаардлагатай тулгаж сонгоорой.",
  battery:
    "Автомашины аккумулятор. Хүчдэл, багтаамж болон хэмжээг автомашиныхаа шаардлагатай тулгаж сонгоорой.",
  plug: "Автомашины хөдөлгүүрийн свеча. Свечаны төрөл болон сэлбэгийн кодыг тулгаж сонгоорой.",
};

export function getProductDescription(product: CatalogProduct) {
  return descriptions[product.kind];
}

export function getRelatedProducts(
  product: CatalogProduct,
  products: CatalogProduct[],
  limit = 4,
) {
  const ranked = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      product: candidate,
      score:
        (candidate.category === product.category ? 10 : 0) +
        candidate.tags.filter(
          (tag) => tag !== "universal" && product.tags.includes(tag),
        ).length,
    }))
    .filter((candidate) => candidate.score > 0);

  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      b.product.addedAt.localeCompare(a.product.addedAt) ||
      a.product.id.localeCompare(b.product.id),
  );
  return ranked
    .slice(0, Math.max(0, limit))
    .map((candidate) => candidate.product);
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
