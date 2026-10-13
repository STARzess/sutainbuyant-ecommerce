"use client";

import { useState } from "react";
import { useCart, updateStoredCart } from "@/lib/cart-store";
import {
  addCartItem,
  MAX_CART_QUANTITY,
} from "@/lib/cart";

export function AddToCart({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const state = useCart();
  const cart = state.items;
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
          let before = 0;
          const next = updateStoredCart(current => {
            before = current.find(item => item.id === productId)?.quantity ?? 0;
            return addCartItem(current, productId, number);
          });
          const after = next.find((item) => item.id === productId)!.quantity;
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
          disabled={!state.ready || !state.storageAvailable || count >= MAX_CART_QUANTITY}
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
