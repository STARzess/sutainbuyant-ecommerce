export function ProductDetailSkeleton() {
  return <div className="container detail-page" role="status" aria-label="Бүтээгдэхүүнийг ачаалж байна"><div aria-hidden="true">
    <div className="skeleton-shape detail-skeleton-line" />
    <div className="skeleton-shape detail-skeleton-line" />
    <div className="product-detail">
      <div className="detail-gallery"><div className="detail-image-button skeleton-shape" style={{ aspectRatio: "1 / 1" }} /></div>
      <div className="detail-skeleton-information">{Array.from({ length: 5 }, (_, index) => <span className="skeleton-shape" key={index} />)}</div>
    </div>
    <div className="skeleton-shape detail-skeleton-description" />
  </div></div>;
}
