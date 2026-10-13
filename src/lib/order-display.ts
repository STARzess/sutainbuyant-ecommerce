import "server-only";
import { formatOrderDate, type OrderSummary } from "./orders-api-client";
import { formatPrice } from "./format";

export type OrderListItem = OrderSummary & { dateLabel: string; totalLabel: string };

export function toOrderListItem(order: OrderSummary): OrderListItem {
  return { ...order, dateLabel: formatOrderDate(order.createdAt), totalLabel: formatPrice(order.total) };
}
