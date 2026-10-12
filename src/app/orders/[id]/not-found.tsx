import Link from "next/link";

export default function OrderNotFound() {
  return <section className="container order-not-found"><h1>Захиалга олдсонгүй</h1><p>Захиалгын дугаараа шалгана уу.</p><Link className="button primary" href="/account">Миний бүртгэл</Link></section>;
}
