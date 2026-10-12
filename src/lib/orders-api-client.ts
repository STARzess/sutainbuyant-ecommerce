import { ApiError, apiRecord, createApiClient } from "./api-client";
import { mapShopImage } from "./shop-api-client";
import type { CatalogProduct } from "./catalog";
import type { CheckoutValues } from "./checkout";

export const orderStatuses = {
  pending: "Хүлээгдэж буй", paid: "Төлөгдсөн", shipped: "Хүргэлтэнд гарсан",
  completed: "Дууссан", cancelled: "Цуцлагдсан",
} as const;
export type OrderStatus = keyof typeof orderStatuses;
export type OrderItem = {
  id: string; productId: string | null; name: string; image?: CatalogProduct["image"];
  unitPrice: number; quantity: number; total: number;
};
export type CustomerOrder = {
  id: string; number: string; status: OrderStatus; statusLabel: string; total: number;
  customerName: string; customerPhone: string; shippingAddress: string;
  note: string | null; createdAt: string | null; items: OrderItem[];
};

export function validOrderId(value: string) {
  return /^[1-9]\d{0,14}$/.test(value) && Number.isSafeInteger(Number(value));
}
function identifier(value: unknown) {
  const id = String(value ?? "");
  if (!validOrderId(id)) throw new ApiError(502);
  return id;
}
function amount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new ApiError(502);
  return value;
}
function text(value: unknown) {
  if (typeof value !== "string") throw new ApiError(502);
  return value;
}

export function mapCustomerOrder(value: unknown, baseUrl: string): CustomerOrder {
  const order = apiRecord(value);
  const status = text(order.status) as OrderStatus;
  if (!Object.hasOwn(orderStatuses, status) || !Array.isArray(order.items)) throw new ApiError(502);
  const items = order.items.map((value: unknown) => {
    const item = apiRecord(value);
    if (typeof item.quantity !== "number" || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new ApiError(502);
    return {
      id: identifier(item.id), productId: item.product_id === null ? null : identifier(item.product_id),
      name: text(item.product_name), image: mapShopImage(item.image, baseUrl),
      unitPrice: amount(item.unit_price), quantity: item.quantity, total: amount(item.line_total),
    };
  });
  return {
    id: identifier(order.id), number: text(order.number), status, statusLabel: orderStatuses[status],
    total: amount(order.total), customerName: text(order.customer_name), customerPhone: text(order.customer_phone),
    shippingAddress: text(order.shipping_address), note: order.note === null ? null : text(order.note),
    createdAt: order.created_at === null ? null : text(order.created_at), items,
  };
}

export function createOrdersApiClient(baseUrl: string, fetcher: typeof fetch = fetch, timeoutMs = 10000) {
  const api = createApiClient(baseUrl, fetcher, timeoutMs);
  return {
    async createOrder(token: string, values: CheckoutValues) {
      const body = await api.request("shop/orders", {
        method: "POST", token,
        data: { customer_name: values.customer_name, customer_phone: values.customer_phone, shipping_address: values.shipping_address, note: values.note, items: values.items.map(({ product_id, quantity }) => ({ product_id, quantity })) },
      });
      const data = apiRecord(body?.data);
      return { id: identifier(data.id) };
    },
    async getOrder(token: string, id: string) {
      if (!validOrderId(id)) return null;
      let body;
      try { body = await api.request(`shop/orders/${id}`, { token, allowMissing: true }); }
      catch (error) { if (error instanceof ApiError && error.status === 403) return null; throw error; }
      if (!body) return null;
      const order = mapCustomerOrder(body.data, api.baseUrl);
      if (order.id !== id) throw new ApiError(502);
      return order;
    },
  };
}

export function formatOrderDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Огноо тодорхойгүй";
  return new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ulaanbaatar" }).format(new Date(value));
}
