
"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, Heart, Plus } from "lucide-react";
import { useEffect, useState } from "react";

function getTimeLeft(endTime) {
  const difference = endTime - Date.now();

  if (difference <= 0) {
    return {
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) /
      (1000 * 60)
  );

  const seconds = Math.floor(
    (difference % (1000 * 60)) / 1000
  );

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export default function FlashSale() {
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [saleEndTime, setSaleEndTime] = useState(null);

  const [timeLeft, setTimeLeft] = useState({
    hours: "12",
    minutes: "34",
    seconds: "00",
  });

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=20`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch sale products"
          );
        }

        const result = await response.json();

        const products = result.data || [];

        const saleItems = products
          .filter(
            (product) =>
              product.comparePrice &&
              product.comparePrice > product.price
          )
          .slice(0, 4);

        setSaleProducts(saleItems);
      } catch (error) {
        console.error(
          "Flash sale products fetch error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  useEffect(() => {
    const endTime =
      Date.now() +
      1000 * 60 * 60 * 12 +
      1000 * 60 * 34;

    setSaleEndTime(endTime);

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#111111] py-20 text-white lg:py-28">
      <div className="container-main">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[#dfff00] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] !text-black">
              Limited time
            </span>

            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
              Flash sale.
              <br />
              Don&apos;t miss it.
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
              Grab selected products at special prices before the timer runs
              out.
            </p>
          </div>

          <div className="shrink-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              <Clock3 size={14} />
              Ends in
            </div>

            <div className="flex items-center gap-2">
              <TimeBox
                value={timeLeft.hours}
                label="Hours"
              />

              <span className="pb-6 text-xl text-white/30">
                :
              </span>

              <TimeBox
                value={timeLeft.minutes}
                label="Min"
              />

              <span className="pb-6 text-xl text-white/30">
                :
              </span>

              <TimeBox
                value={timeLeft.seconds}
                label="Sec"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {loading ? (
            Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="animate-pulse"
                >
                  <div className="aspect-[4/5] rounded-[24px] bg-[#1b1b1b]" />

                  <div className="px-1 pt-4">
                    <div className="h-3 w-20 rounded bg-white/10" />

                    <div className="mt-2 h-5 w-32 rounded bg-white/10" />

                    <div className="mt-2 h-4 w-24 rounded bg-white/10" />
                  </div>
                </div>
              )
            )
          ) : saleProducts.length > 0 ? (
            saleProducts.map((product) => (
              <SaleCard
                key={product._id}
                product={product}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-sm text-white/40">
              No sale products available.
            </div>
          )}
        </div>

        <div className="mt-10">
          <Link
            href="/products?discount=true"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-medium !text-[#111111] transition hover:bg-[#dfff00]"
          >
            Shop all deals

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black !text-white transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight
                size={15}
                strokeWidth={2}
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="min-w-[64px] rounded-[16px] border border-white/10 bg-white/5 px-3 py-3 text-center backdrop-blur-sm sm:min-w-[76px]">
      <div className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
        {value}
      </div>

      <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/40">
        {label}
      </div>
    </div>
  );
}

function SaleCard({ product }) {
  const [liked, setLiked] = useState(false);

  const productId = product._id;

  const image =
    product.images?.[0] ||
    "/placeholder-product.jpg";

  const category =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const discount =
    product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice -
            product.price) /
            product.comparePrice) *
            100
        )
      : 0;

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-[24px] bg-[#1b1b1b]">
        <Link
          href={`/products/${productId}`}
          className="block aspect-[4/5] overflow-hidden"
        >
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>

        <span className="absolute left-4 top-4 rounded-full bg-[#dfff00] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] !text-black">
          Sale
        </span>

        <button
          type="button"
          onClick={() =>
            setLiked((prev) => !prev)
          }
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition ${
            liked
              ? "bg-white !text-black"
              : "bg-black/35 !text-white hover:bg-white hover:!text-black"
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={17}
            strokeWidth={1.7}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <button
          type="button"
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white !text-black opacity-0 shadow-lg transition duration-300 group-hover:opacity-100"
          aria-label="Add to cart"
        >
          <Plus
            size={18}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div className="px-1 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
          {category || "Product"}
        </p>

        <Link
          href={`/products/${productId}`}
          className="mt-1 block text-base font-medium leading-5 tracking-[-0.02em] !text-white"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold !text-white">
            ${product.price}
          </span>

          <span className="text-sm text-white/35 line-through">
            ${product.comparePrice}
          </span>

          {discount > 0 && (
            <span className="ml-auto rounded-full bg-white/10 px-2 py-1 text-[9px] font-semibold text-[#dfff00]">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
