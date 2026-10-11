"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { catalogHref, parseCatalogQuery } from "@/lib/catalog";

export function CatalogForm({
  children,
  initialFiltersOpen = false,
  options,
}: {
  children: React.ReactNode;
  initialFiltersOpen?: boolean;
  options: { categories: { id: string }[]; tags: { id: string }[] };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(initialFiltersOpen);

  return (
    <form
      className={`catalog-layout${filtersOpen ? " filters-open" : ""}`}
      action="/products"
      method="get"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        const values = Object.fromEntries(
          new FormData(event.currentTarget),
        ) as Record<string, string>;
        const query = parseCatalogQuery(values, options);
        startTransition(() =>
          router.push(catalogHref(query), { scroll: false }),
        );
      }}
      onChange={(event) => {
        if (
          event.target instanceof HTMLSelectElement &&
          event.target.name === "sort"
        ) {
          event.currentTarget.requestSubmit();
        }
      }}
    >
      <div className="catalog-mobile-actions">
        <button
          type="button"
          className="filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M4 7h16M7 12h10M10 17h4" />
          </svg>
          {filtersOpen ? "Шүүлтүүр хаах" : "Шүүлтүүр"}
        </button>
      </div>
      {children}
      <p className="catalog-status" role="status">
        {pending ? "Бүтээгдэхүүнүүдийг шинэчилж байна…" : ""}
      </p>
    </form>
  );
}
