"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { orderStatuses, type OrderStatus } from "@/lib/orders-api-client";
import type { OrderListItem } from "@/lib/order-display";
import { OrderStatusBadge } from "./order-status";

export function OrdersList({ orders }: { orders: OrderListItem[] }) {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const filterId = useId();
  const filtered = status === "all" ? orders : orders.filter((order) => order.status === status);

  if (!orders.length) return <section className="orders-empty">
    <h2>Танд захиалга одоогоор алга байна</h2>
    <p>Бүтээгдэхүүнээ сонгож, анхны захиалгаа хийгээрэй.</p>
    <Link className="button primary" href="/products">Бүтээгдэхүүн үзэх</Link>
  </section>;

  return <>
    <div className="orders-toolbar">
      <p role="status">{filtered.length} захиалга</p>
      <div className="orders-filter"><label htmlFor={filterId}>Захиалгын төлөв</label><select id={filterId} value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | "all")}>
        <option value="all">Бүх захиалга</option>
        {Object.entries(orderStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></div>
    </div>
    {filtered.length ? <ul className="orders-list">{filtered.map((order) => <li className="orders-card" key={order.id} data-order-id={order.id}>
      <div className="orders-card-info"><h2><Link href={`/orders/${order.id}`}>{order.number}</Link></h2><time dateTime={order.createdAt ?? undefined}>{order.dateLabel}</time>{order.itemsCount !== undefined && <p>{order.itemsCount} төрөл</p>}</div>
      <OrderStatusBadge status={order.status} />
      <strong className="orders-card-total">{order.totalLabel}</strong>
      <Link className="orders-detail-link" href={`/orders/${order.id}`} aria-label={`${order.number} дэлгэрэнгүй`}>Дэлгэрэнгүй</Link>
    </li>)}</ul> : <section className="orders-empty orders-filter-empty"><h2>Энэ төлөвтэй захиалга алга байна</h2><button className="button orders-secondary" type="button" onClick={() => setStatus("all")}>Бүх захиалгыг харах</button></section>}
  </>;
}
