"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container shop-error" role="alert">
      <h1>Мэдээллийг ачаалж чадсангүй</h1>
      <p>Түр хүлээгээд дахин оролдоно уу.</p>
      <button className="button primary" type="button" onClick={reset}>Дахин оролдох</button>
    </div>
  );
}
