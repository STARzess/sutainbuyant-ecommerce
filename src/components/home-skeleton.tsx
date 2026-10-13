export function HomeSkeleton() {
  return <div className="container home-page" role="status" aria-label="Бүтээгдэхүүнүүдийг ачаалж байна"><div aria-hidden="true">
    <div className="skeleton-shape home-skeleton-hero" />
    <div className="skeleton-shape home-skeleton-heading" />
    <div className="category-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-shape home-skeleton-category" key={index} />)}</div>
    <div className="skeleton-shape home-skeleton-heading" />
    <div className="product-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-shape home-skeleton-product" key={index} />)}</div>
  </div></div>;
}
