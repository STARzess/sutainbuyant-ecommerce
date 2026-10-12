import Link from "next/link";
import { formatOrderDate, type CustomerOrder } from "@/lib/orders-api-client";
import { formatPrice } from "@/lib/home-products";
import { ProductImage } from "./product-image";

export function OrderReceipt({ order }: { order: CustomerOrder }) {
  return <>
    <header className="order-heading"><div><p>ЗАХИАЛГЫН ДЭЛГЭРЭНГҮЙ</p><h1>{order.number}</h1><time dateTime={order.createdAt ?? undefined}>{formatOrderDate(order.createdAt)}</time></div><span className={`order-status order-status-${order.status}`}>{order.statusLabel}</span></header>
    <div className="order-layout">
      <section className="checkout-card" aria-labelledby="order-items-title">
        <div className="checkout-card-heading"><h2 id="order-items-title">Захиалсан бүтээгдэхүүнүүд</h2><span>{order.items.reduce((total, item) => total + item.quantity, 0)} ширхэг</span></div>
        {order.items.length ? <ul className="order-items">{order.items.map((item) => <li key={item.id}>
          <span className="checkout-item-image"><ProductImage product={item} size="cart" /></span>
          <div className="checkout-item-info"><h3>{item.productId ? <Link href={`/products/${item.productId}`}>{item.name}</Link> : item.name}</h3><p>{formatPrice(item.unitPrice)} × {item.quantity}</p></div>
          <strong>{formatPrice(item.total)}</strong>
        </li>)}</ul> : <p className="order-empty">Энэ захиалгад бүтээгдэхүүн бүртгэгдээгүй байна.</p>}
        <dl className="checkout-total"><dt>Нийт дүн</dt><dd data-testid="order-total">{formatPrice(order.total)}</dd></dl>
      </section>
      <section className="checkout-card order-delivery" aria-labelledby="order-delivery-title">
        <div className="checkout-card-heading"><h2 id="order-delivery-title">Хүргэлтийн мэдээлэл</h2></div>
        <dl><div><dt>Хүлээн авагч</dt><dd>{order.customerName}</dd></div><div><dt>Утасны дугаар</dt><dd>{order.customerPhone}</dd></div><div><dt>Хүргэлтийн хаяг</dt><dd>{order.shippingAddress}</dd></div>{order.note && <div><dt>Тэмдэглэл</dt><dd>{order.note}</dd></div>}</dl>
      </section>
    </div>
    <Link className="order-browse" href="/products">Бүтээгдэхүүн үзэх </Link>
  </>;
}
