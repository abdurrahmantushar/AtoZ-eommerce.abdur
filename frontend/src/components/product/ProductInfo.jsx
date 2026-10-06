"use client";

import {
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";

export default function ProductInfo({ product }) {
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { toggleWishlist, isWishlisted } =
    useWishlist();

  const productId =
    product?.id || product?._id;

  const liked = isWishlisted(productId);

  const [selectedColor, setSelectedColor] =
    useState(product?.colors?.[0] || "");

  const [selectedSize, setSelectedSize] =
    useState(product?.sizes?.[0] || "");

  const stock = Number(product?.stock || 0);

  const hasOldPrice =
    Number(product?.oldPrice) > Number(product?.price);

  const discountPercent = hasOldPrice
    ? Math.round(
        ((Number(product.oldPrice) -
          Number(product.price)) /
          Number(product.oldPrice)) *
          100
      )
    : 0;

  const increaseQuantity = () => {
    if (stock <= 0) return;

    setQuantity((prev) =>
      Math.min(prev + 1, stock)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      Math.max(1, prev - 1)
    );
  };

  const handleAddToCart = () => {
    if (!productId || stock <= 0) return;

    addToCart(product, quantity, {
      selectedColor,
      selectedSize,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {product?.category}
      </p>

      <h1 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">
        {product?.name}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Star
            size={15}
            fill="currentColor"
          />

          <span className="text-sm font-medium">
            {product?.rating || 0}
          </span>

          <span className="text-sm text-[var(--muted)]">
            ({product?.reviews || 0} reviews)
          </span>
        </div>

        <span className="h-1 w-1 rounded-full bg-[var(--muted-light)]" />

        <span
          className={`text-sm ${
            stock > 0
              ? "text-green-700"
              : "text-red-600"
          }`}
        >
          {stock > 0
            ? "In stock"
            : "Out of stock"}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-semibold">
          ${Number(product?.price || 0).toFixed(2)}
        </span>

        {hasOldPrice && (
          <>
            <span className="text-base text-[var(--muted-light)] line-through">
              ${Number(product.oldPrice).toFixed(2)}
            </span>

            <span className="rounded-full bg-[#111111] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Save {discountPercent}%
            </span>
          </>
        )}
      </div>

      <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)]">
        {product?.description ||
          "A carefully selected product designed for everyday use, combining practical function with a clean modern aesthetic."}
      </p>

      {product?.colors?.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
              Color
            </span>

            <span className="text-xs text-[var(--muted)]">
              {selectedColor}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() =>
                  setSelectedColor(color)
                }
                className={`rounded-full border px-4 py-2.5 text-sm transition ${
                  selectedColor === color
                    ? "border-[#111111] bg-[#111111] !text-white"
                    : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#111111]"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {product?.sizes?.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
              Size
            </span>

            <button
              type="button"
              className="text-xs font-medium underline underline-offset-4"
            >
              Size guide
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() =>
                  setSelectedSize(size)
                }
                className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition ${
                  selectedSize === size
                    ? "border-[#111111] bg-[#111111] !text-white"
                    : "border-[var(--border)] bg-white hover:border-[#111111]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 items-center justify-between rounded-full border border-[var(--border)] bg-white px-2 sm:w-[150px]">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={stock <= 0}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>

          <span className="text-sm font-medium">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              stock <= 0 ||
              quantity >= stock
            }
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="h-14 flex-1 rounded-full bg-[#111111] px-6 text-sm font-medium !text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:bg-[#999999]"
        >
          {stock <= 0
            ? "Out of stock"
            : added
              ? "Added to cart ✓"
              : "Add to cart"}
        </button>

        <button
          type="button"
          onClick={() =>
            toggleWishlist(product)
          }
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition ${
            liked
              ? "border-[#111111] bg-[#111111] !text-white"
              : "border-[var(--border)] bg-white hover:border-[#111111]"
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={19}
            strokeWidth={1.7}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      <div className="mt-8 grid gap-4 border-y border-[var(--border)] py-6 sm:grid-cols-2">
        <InfoItem
          icon={
            <Truck
              size={18}
              strokeWidth={1.7}
            />
          }
          title="Fast delivery"
          text="Estimated delivery in 2–5 days."
        />

        <InfoItem
          icon={
            <ShieldCheck
              size={18}
              strokeWidth={1.7}
            />
          }
          title="Secure checkout"
          text="Your payment information is protected."
        />
      </div>

      <p className="mt-5 text-xs text-[var(--muted)]">
        {stock > 0
          ? `${stock} items currently available`
          : "Currently unavailable"}
      </p>
    </div>
  );
}

function InfoItem({
  icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecece7]">
        {icon}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.1em]">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          {text}
        </p>
      </div>
    </div>
  );
}
