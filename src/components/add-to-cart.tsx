"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  addCartItem,
  parseCart,
  CART_STORAGE_KEY,
  MAX_CART_QUANTITY,
} from "@/lib/cart";

const CART_CHANGE_EVENT = "sutainbuyant:cart-change";

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CART_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CART_CHANGE_EVENT, onChange);
  };
}
function snapshot() {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}
function serverSnapshot() {
  return "";
}

export function AddToCart({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const rawCart = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const cart = useMemo(() => parseCart(rawCart), [rawCart]);
  const count = cart.find((item) => item.id === productId)?.quantity ?? 0;
  const [quantity, setQuantity] = useState("1");
  const [notice, setNotice] = useState("");
  const number = Number(quantity);

  return (
    <form
      className="product-purchase"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (
          !Number.isSafeInteger(number) ||
          number < 1 ||
          number > MAX_CART_QUANTITY
        ) {
          setNotice(`Тоо ширхэгийг 1–${MAX_CART_QUANTITY} хооронд оруулна уу.`);
          return;
        }
        try {
          const current = parseCart(
            window.localStorage.getItem(CART_STORAGE_KEY),
          );
          const before =
            current.find((item) => item.id === productId)?.quantity ?? 0;
          const next = addCartItem(current, productId, number);
          const after = next.find((item) => item.id === productId)!.quantity;
          window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(CART_CHANGE_EVENT));
          setNotice(
            after > before
              ? `${after - before} ширхэг сагсанд нэмэгдлээ.`
              : `Нэг бүтээгдэхүүнээс хамгийн ихдээ ${MAX_CART_QUANTITY} ширхэг нэмэх боломжтой.`,
          );
        } catch {
          setNotice("Сагсанд хадгалж чадсангүй. Дахин оролдоно уу.");
        }
      }}
    >
      <div className="purchase-row">
        <div className="quantity-field">
          <label htmlFor={`quantity-${productId}`}>Тоо ширхэг</label>
          <div className="quantity-control">
            <button
              type="button"
              aria-label="Тоо ширхэг хасах"
              disabled={number <= 1}
              onClick={() => {
                setQuantity(
                  String(
                    Math.max(
                      1,
                      (Number.isSafeInteger(number) ? number : 1) - 1,
                    ),
                  ),
                );
                setNotice("");
              }}
            >
              −
            </button>
            <input
              id={`quantity-${productId}`}
              name="quantity"
              type="number"
              min="1"
              max={MAX_CART_QUANTITY}
              step="1"
              value={quantity}
              aria-label={`${productName} тоо ширхэг`}
              onChange={(event) => {
                setQuantity(event.target.value);
                setNotice("");
              }}
            />
            <button
              type="button"
              aria-label="Тоо ширхэг нэмэх"
              disabled={number >= MAX_CART_QUANTITY}
              onClick={() => {
                setQuantity(
                  String(
                    Math.min(
                      MAX_CART_QUANTITY,
                      Math.max(
                        1,
                        (Number.isSafeInteger(number) ? number : 1) + 1,
                      ),
                    ),
                  ),
                );
                setNotice("");
              }}
            >
              +
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="button primary add-cart-button"
          disabled={count >= MAX_CART_QUANTITY}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2M9 13h6m-3-3v6" />
          </svg>
          Сагсанд нэмэх
        </button>
      </div>
      <p className="purchase-status" role="status" aria-live="polite">
        {notice || (count ? `Сагсанд ${count} ширхэг байна.` : "")}
      </p>
    </form>
  );
}
