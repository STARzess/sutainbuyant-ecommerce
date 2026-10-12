import type { FieldErrors } from "./api-client";
import type { CartItem } from "./cart";

export const MAX_ORDER_ITEMS = 50;
export type CheckoutValues = {
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  note: string | null;
  items: { product_id: number; quantity: number }[];
};

export function validateCheckout(input: unknown) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const text = (key: string) => typeof source[key] === "string" ? (source[key] as string).trim() : "";
  const values: CheckoutValues = {
    customer_name: text("customer_name"), customer_phone: text("customer_phone"),
    shipping_address: text("shipping_address"), note: text("note") || null, items: [],
  };
  const errors: FieldErrors = {};
  if (!values.customer_name) errors.customer_name = ["Хүлээн авагчийн нэрээ оруулна уу."];
  else if (values.customer_name.length > 100) errors.customer_name = ["Нэр 100 тэмдэгтээс хэтрэхгүй байна."];
  if (!values.customer_phone) errors.customer_phone = ["Утасны дугаараа оруулна уу."];
  else if (!/^\+?[0-9\s-]{8,20}$/.test(values.customer_phone) || values.customer_phone.replace(/\D/g, "").length < 8) errors.customer_phone = ["Утасны дугаараа зөв оруулна уу."];
  if (!values.shipping_address) errors.shipping_address = ["Хүргэлтийн хаягаа оруулна уу."];
  else if (values.shipping_address.length > 500) errors.shipping_address = ["Хаяг 500 тэмдэгтээс хэтрэхгүй байна."];
  if (values.note && values.note.length > 1000) errors.note = ["Тэмдэглэл 1000 тэмдэгтээс хэтрэхгүй байна."];
  if (source.note !== undefined && source.note !== null && typeof source.note !== "string") errors.note = ["Тэмдэглэлээ зөв оруулна уу."];
  if (!Array.isArray(source.items) || !source.items.length) errors.items = ["Захиалах бүтээгдэхүүнээ сагсанд нэмнэ үү."];
  else if (source.items.length > MAX_ORDER_ITEMS) errors.items = [`Нэг захиалгад ${MAX_ORDER_ITEMS} хүртэл төрлийн бүтээгдэхүүн сонгоно уу.`];
  else {
    const seen = new Set<number>();
    source.items.forEach((value: unknown, index: number) => {
      const item = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
      const id = item.product_id;
      const quantity = item.quantity;
      if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1 || seen.has(id)) errors[`items.${index}.product_id`] = ["Бүтээгдэхүүнээ шалгаад сагсаа шинэчилнэ үү."];
      else seen.add(id);
      if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) errors[`items.${index}.quantity`] = ["Тоо ширхэгийг 1–100 хооронд оруулна уу."];
      if (typeof id === "number" && typeof quantity === "number") values.items.push({ product_id: id, quantity });
    });
  }
  return { values, errors, valid: !Object.keys(errors).length };
}

export function checkoutFieldErrors(errors: FieldErrors): FieldErrors {
  const translated: FieldErrors = {};
  const fields: Record<string, string> = {
    customer_name: "Хүлээн авагчийн нэрээ шалгана уу.",
    customer_phone: "Утасны дугаараа зөв оруулна уу.",
    shipping_address: "Хүргэлтийн хаягаа шалгана уу.",
    note: "Тэмдэглэл 1000 тэмдэгтээс хэтрэхгүй байна.",
    items: "Бүтээгдэхүүнүүдээ шалгаад сагсаа шинэчилнэ үү.",
  };
  for (const [field, messages] of Object.entries(errors)) {
    if (!messages.length) continue;
    if (Object.hasOwn(fields, field)) translated[field] = [fields[field]];
    else if (/^items\.[0-9]{1,2}\.(product_id|quantity)$/.test(field)) {
      translated[field] = [field.endsWith("quantity") ? "Тоо ширхэгийг шалгаад сагсаа шинэчилнэ үү." : "Энэ бүтээгдэхүүнийг захиалах боломжгүй байна."];
    }
  }
  return translated;
}

// Keep products or additional quantities added in another tab during submission.
export function subtractPurchasedItems(current: CartItem[], purchased: CartItem[]): CartItem[] {
  const quantities = new Map(purchased.map((item) => [item.id, item.quantity]));
  return current.flatMap((item) => {
    const remaining = item.quantity - (quantities.get(item.id) ?? 0);
    return remaining > 0 ? [{ id: item.id, quantity: remaining }] : [];
  });
}
