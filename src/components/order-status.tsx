import { orderStatuses, type OrderStatus } from "@/lib/orders-api-client";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`order-status order-status-${status}`}>{orderStatuses[status]}</span>;
}
