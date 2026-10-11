import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CatalogForm } from "@/components/catalog-form";
import { ProductCard } from "@/components/product-card";
import { catalogProducts } from "@/lib/catalog-products";
import {
  catalogCategories,
  catalogTags,
  catalogSorts,
  catalogHref,
  parseCatalogQuery,
  getCatalogPage,
  type CatalogQuery,
  type SearchParams,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/home-products";

export const metadata: Metadata = {
  title: "Бүтээгдэхүүн | Сутайн Буянт",
  description:
    "Автомашины сэлбэгийг нэр, код, ангилал, таг болон үнээр хайж олоорой.",
};

function ActiveFilters({ query }: { query: CatalogQuery }) {
  const filters: { label: string; changes: Partial<CatalogQuery> }[] = [];
  if (query.q) filters.push({ label: `Хайлт: ${query.q}`, changes: { q: "" } });
  if (query.category)
    filters.push({
      label: catalogCategories.find((item) => item.id === query.category)!.name,
      changes: { category: "" },
    });
  if (query.tag)
    filters.push({
      label: catalogTags.find((item) => item.id === query.tag)!.name,
      changes: { tag: "" },
    });
  if (query.min !== undefined)
    filters.push({
      label: `${formatPrice(query.min)}-өөс`,
      changes: { min: undefined },
    });
  if (query.max !== undefined)
    filters.push({
      label: `${formatPrice(query.max)} хүртэл`,
      changes: { max: undefined },
    });
  if (!filters.length) return null;
  return (
    <div className="active-filters" aria-label="Сонгосон шүүлтүүрүүд">
      {filters.map((filter) => (
        <Link
          key={filter.label}
          href={catalogHref(query, { ...filter.changes, page: 1 })}
          scroll={false}
          className="filter-chip"
          aria-label={`${filter.label} шүүлтүүрийг арилгах`}
        >
          {filter.label}
          <span aria-hidden="true">×</span>
        </Link>
      ))}
      <Link className="clear-filters" href="/products">
        Бүгдийг арилгах
      </Link>
    </div>
  );
}

async function Catalog({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = parseCatalogQuery(await searchParams);
  const result = getCatalogPage(catalogProducts, query);
  if (result.page !== query.page)
    redirect(catalogHref(query, { page: result.page }));

  return (
    <CatalogForm
      key={catalogHref(query)}
      initialFiltersOpen={result.invalidPriceRange}
    >
      <div className="catalog-search">
        <label className="visually-hidden" htmlFor="catalog-search">
          Сэлбэг хайх
        </label>
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <input
          id="catalog-search"
          type="search"
          name="q"
          defaultValue={query.q}
          maxLength={120}
          placeholder="Сэлбэгийн нэр, машины загвар, кодоор хайх"
        />
        <button type="submit" className="button primary">
          Хайх
        </button>
      </div>

      <aside
        id="catalog-filters"
        className="catalog-filters"
        aria-label="Бүтээгдэхүүний шүүлтүүр"
      >
        <div className="filter-heading">
          <h2>Шүүлтүүр</h2>
          <Link href="/products" aria-label="Бүх шүүлтүүрийг цэвэрлэх">
            Цэвэрлэх
          </Link>
        </div>
        <fieldset className="filter-group">
          <legend>Ангилал</legend>
          <label className="category-option">
            <input
              type="radio"
              name="category"
              value=""
              defaultChecked={!query.category}
            />
            <span>Бүх сэлбэг</span>
            <small>{catalogProducts.length}</small>
          </label>
          {catalogCategories.map((category) => (
            <label className="category-option" key={category.id}>
              <input
                type="radio"
                name="category"
                value={category.id}
                defaultChecked={query.category === category.id}
              />
              <span>{category.name}</span>
              <small>
                {
                  catalogProducts.filter(
                    (product) => product.category === category.name,
                  ).length
                }
              </small>
            </label>
          ))}
        </fieldset>
        <div className="filter-group">
          <label htmlFor="catalog-tag" className="filter-label">
            Таг
          </label>
          <select id="catalog-tag" name="tag" defaultValue={query.tag}>
            <option value="">Бүх таг</option>
            {catalogTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="filter-group price-filter">
          <legend>Үнэ (₮)</legend>
          <div className="price-inputs">
            <label htmlFor="price-min">
              Доод үнэ
              <input
                id="price-min"
                name="min"
                type="number"
                min="0"
                max="1000000000"
                step="1"
                defaultValue={query.min ?? ""}
                placeholder="0"
                aria-describedby={
                  result.invalidPriceRange ? "price-error" : undefined
                }
                aria-invalid={result.invalidPriceRange || undefined}
              />
            </label>
            <label htmlFor="price-max">
              Дээд үнэ
              <input
                id="price-max"
                name="max"
                type="number"
                min="0"
                max="1000000000"
                step="1"
                defaultValue={query.max ?? ""}
                placeholder="Хязгааргүй"
                aria-describedby={
                  result.invalidPriceRange ? "price-error" : undefined
                }
                aria-invalid={result.invalidPriceRange || undefined}
              />
            </label>
          </div>
          {result.invalidPriceRange && (
            <p id="price-error" className="field-error">
              Доод үнэ дээд үнээс их байна.
            </p>
          )}
        </fieldset>
        <button type="submit" className="button primary apply-filters">
          Шүүлтүүр хэрэглэх
        </button>
      </aside>

      <section className="catalog-results" aria-labelledby="results-title">
        <div className="catalog-toolbar">
          <div>
            <h2 id="results-title">
              Сэлбэгүүд <span>{result.total}</span>
            </h2>
            <p>
              {result.total
                ? `${result.start}–${result.end} / ${result.total} бүтээгдэхүүн`
                : "0 бүтээгдэхүүн"}
            </p>
          </div>
          <div className="catalog-sort">
            <label htmlFor="catalog-sort">Эрэмбэлэх</label>
            <select id="catalog-sort" name="sort" defaultValue={query.sort}>
              {catalogSorts.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ActiveFilters query={query} />
        {result.products.length ? (
          <div className="product-grid catalog-grid">
            {result.products.map((product) => (
              <ProductCard key={product.id} product={product} returnTo={catalogHref(query)} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5M8 10.5h5" />
            </svg>
            <h3>Тохирох сэлбэг олдсонгүй</h3>
            <p>
              {result.invalidPriceRange
                ? "Үнийн хязгаараа зөв оруулаад дахин хайна уу."
                : "Хайлтын үг эсвэл шүүлтүүрээ өөрчилж дахин хайна уу."}
            </p>
            <Link className="button primary" href="/products">
              Бүх сэлбэгийг харах
            </Link>
          </div>
        )}
        {result.pages > 1 && (
          <nav className="pagination" aria-label="Бүтээгдэхүүний хуудаслалт">
            {result.page > 1 ? (
              <Link
                className="pagination-arrow"
                href={catalogHref(query, { page: result.page - 1 })}
                aria-label="Өмнөх хуудас"
              >
                ←
              </Link>
            ) : (
              <span className="pagination-arrow disabled" aria-hidden="true">
                ←
              </span>
            )}
            {Array.from({ length: result.pages }, (_, index) => index + 1).map(
              (page) => (
                <Link
                  key={page}
                  href={catalogHref(query, { page })}
                  aria-label={`${page}-р хуудас`}
                  aria-current={page === result.page ? "page" : undefined}
                >
                  {page}
                </Link>
              ),
            )}
            {result.page < result.pages ? (
              <Link
                className="pagination-arrow"
                href={catalogHref(query, { page: result.page + 1 })}
                aria-label="Дараах хуудас"
              >
                →
              </Link>
            ) : (
              <span className="pagination-arrow disabled" aria-hidden="true">
                →
              </span>
            )}
          </nav>
        )}
      </section>
    </CatalogForm>
  );
}

function CatalogSkeleton() {
  return (
    <div
      className="catalog-skeleton"
      role="status"
      aria-label="Бүтээгдэхүүнүүдийг ачаалж байна"
    >
      <div className="skeleton-search" />
      <div className="skeleton-body">
        <div className="skeleton-sidebar" />
        <div className="product-grid catalog-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton-card" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="container catalog-page">
      <nav className="breadcrumb" aria-label="Хуудасны зам">
        <Link href="/">Нүүр</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Бүтээгдэхүүн</span>
      </nav>
      <div className="catalog-heading">
        <p className="eyebrow">СУТАЙН БУЯНТ / АВТО СЭЛБЭГ</p>
        <h1>Бүтээгдэхүүн</h1>
        <p>Таны автомашинд тохирох сэлбэгийг олоорой.</p>
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
