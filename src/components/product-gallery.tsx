"use client";

import { useRef } from "react";

export function ProductGallery({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <div className="detail-gallery">
      <button
        type="button"
        className="detail-image-button"
        aria-label={`${name} зургийг томруулах`}
        onClick={() => dialog.current?.showModal()}
      >
        {children}
        <span className="image-zoom-label">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5" />
          </svg>
          Томруулах
        </span>
      </button>
      <dialog
        ref={dialog}
        className="product-image-dialog"
        aria-labelledby="image-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="image-dialog-content">
          <div className="image-dialog-heading">
            <h2 id="image-dialog-title">{name}</h2>
            <button
              type="button"
              aria-label="Зургийг хаах"
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
          </div>
          <div className="image-dialog-art">{children}</div>
        </div>
      </dialog>
    </div>
  );
}
