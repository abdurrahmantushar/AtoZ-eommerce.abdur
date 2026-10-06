
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

async function getPromoProducts() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=20`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch promo products");
    }

    const result = await response.json();

    const products = result.data || [];

    return products
      .filter(
        (product) =>
          product.comparePrice &&
          product.comparePrice > product.price &&
          product.images?.[0]
      )
      .slice(0, 3);
  } catch (error) {
    console.error(
      "Promo products fetch error:",
      error
    );

    return [];
  }
}

export default async function PromoBanner() {
  const promoProducts = await getPromoProducts();

  return (
    <section className="container-main section-space-sm">
      <div className="overflow-hidden rounded-[28px] bg-[#e7e5de]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[520px] flex-col justify-between p-7 sm:p-10 lg:p-14">
            <div>
              <span className="inline-flex rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/60 backdrop-blur-sm">
                AtoZ selection
              </span>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
                One place. Everything you need.
              </p>

              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#111111] sm:text-5xl lg:text-6xl">
                Better finds for
                <br />
                everyday life.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-black/55 sm:text-base">
                Explore carefully selected products across
                tech, beauty, home, fashion and more.
              </p>
            </div>

            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">
                  Up to 30%
                </span>

                <span className="text-xs font-medium uppercase tracking-[0.15em] text-black/45">
                  selected products
                </span>
              </div>

              <Link
                href="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white transition hover:bg-[#dfff00] hover:!text-black"
              >
                Shop the collection

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight
                    size={15}
                    strokeWidth={2}
                  />
                </span>
              </Link>
            </div>
          </div>

          <div className="grid min-h-[420px] grid-cols-3 grid-rows-2 gap-2 p-2 sm:gap-3 sm:p-3 lg:min-h-[520px]">
            {promoProducts.length > 0 ? (
              promoProducts.map((product, index) => {
                const className =
                  index === 0
                    ? "col-span-2 row-span-2"
                    : "col-span-1 row-span-1";

                const category =
                  typeof product.category === "object"
                    ? product.category?.name
                    : product.category;

                return (
                  <Link
                    href={`/products/${product._id}`}
                    key={product._id}
                    className={`group relative overflow-hidden rounded-[20px] ${className}`}
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-3 bottom-3">
                      <span className="inline-flex rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black backdrop-blur-md">
                        {category || product.name}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full row-span-2 flex items-center justify-center rounded-[20px] bg-black/5 text-sm text-black/40">
                No promotional products available.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

