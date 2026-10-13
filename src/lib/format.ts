export function formatPrice(value: number) {
  return `${new Intl.NumberFormat("mn-MN").format(value)} ₮`;
}
