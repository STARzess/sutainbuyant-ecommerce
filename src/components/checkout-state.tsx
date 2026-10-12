import Link from "next/link";

export function CheckoutLoading() {
  return <div className="checkout-loading" role="status" aria-label="Захиалгын мэдээллийг ачаалж байна"><div /><div /><div /></div>;
}

export function CheckoutState({ title, children, href, label, retry }: {
  title: string; children: React.ReactNode; href?: string; label?: string; retry?: () => void;
}) {
  return <section className="checkout-state">
    <span className="checkout-state-icon" aria-hidden="true"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2" /></svg></span>
    <h2>{title}</h2><div className="checkout-state-copy">{children}</div>
    {href && <Link className="button primary" href={href}>{label}</Link>}
    {retry && <button className="button primary" type="button" onClick={retry}>Дахин оролдох</button>}
  </section>;
}
