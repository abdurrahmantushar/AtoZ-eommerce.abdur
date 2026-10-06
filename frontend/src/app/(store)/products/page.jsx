
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductFilter from "@/components/product/ProductFilter";
import ProductSort from "@/components/product/ProductSort";

const priceRanges = {
  "under-50": {
    minPrice: 0,
    maxPrice: 50,
  },

  "50-100": {
    minPrice: 50,
    maxPrice: 100,
  },

  "100-200": {
    minPrice: 100,
    maxPrice: 200,
  },

  "200-plus": {
    minPrice: 200,
  },
};

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [selectedPriceRange, setSelectedPriceRange] =
    useState("All");

  const [sort, setSort] = useState("featured");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSort = searchParams.get("sort");

    if (urlCategory) {
      const formattedCategory =
        urlCategory.charAt(0).toUpperCase() +
        urlCategory.slice(1).toLowerCase();

      setSelectedCategory(formattedCategory);
    } else {
      setSelectedCategory("All");
    }

    if (urlSort) {
      setSort(urlSort);
    } else {
      setSort("featured");
    }
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        const searchTerm = search.trim();

        if (searchTerm) {
          params.set("q", searchTerm);
        }

        if (selectedCategory !== "All") {
          params.set(
            "category",
            selectedCategory.toLowerCase()
          );
        }

        if (selectedPriceRange !== "All") {
          const range =
            priceRanges[selectedPriceRange];

          if (range?.minPrice !== undefined) {
            params.set(
              "minPrice",
              range.minPrice
            );
          }

          if (range?.maxPrice !== undefined) {
            params.set(
              "maxPrice",
              range.maxPrice
            );
          }
        }

        if (sort) {
          params.set("sort", sort);
        }

        params.set("page", "1");
        params.set("limit", "100");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const result = await response.json();

        setProducts(result.data || []);

        setTotalProducts(
          result.pagination?.total ??
            result.data?.length ??
            0
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Products fetch error:",
            error
          );

          setProducts([]);
          setTotalProducts(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timeout = setTimeout(
      fetchProducts,
      search.trim() ? 400 : 0
    );

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    search,
    selectedCategory,
    selectedPriceRange,
    sort,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedPriceRange("All");
    setSort("featured");
  };

  const hasFilters =
    selectedCategory !== "All" ||
    selectedPriceRange !== "All" ||
    search !== "";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main section-space">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.8}
              />
              Back to home
            </Link>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
                  Collection
                </span>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-5xl">
                  {selectedCategory === "All"
                    ? "All products"
                    : selectedCategory}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  Discover products across our complete
                  collection.
                </p>
              </div>

              <p className="text-sm text-[var(--muted)]">
                <span className="font-semibold text-[#111111]">
                  {totalProducts}
                </span>{" "}
                {totalProducts === 1
                  ? "product"
                  : "products"}
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
            <aside className="hidden lg:block">
              <ProductFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={
                  setSelectedCategory
                }
                selectedPriceRange={
                  selectedPriceRange
                }
                setSelectedPriceRange={
                  setSelectedPriceRange
                }
              />
            </aside>

            <div>
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search products..."
                      className="w-full rounded-2xl border border-transparent bg-[#f5f5f2] px-4 py-3.5 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
                    />
                  </div>

                  <ProductSort
                    sort={sort}
                    setSort={setSort}
                  />
                </div>
              </div>

              {hasFilters && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {selectedCategory !== "All" && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategory("All")
                      }
                      className="rounded-full bg-[#111111] px-3.5 py-2 text-xs font-medium text-white"
                    >
                      {selectedCategory} ×
                    </button>
                  )}

                  {selectedPriceRange !==
                    "All" && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPriceRange("All")
                      }
                      className="rounded-full bg-[#111111] px-3.5 py-2 text-xs font-medium text-white"
                    >
                      Price ×
                    </button>
                  )}

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="rounded-full bg-[#111111] px-3.5 py-2 text-xs font-medium text-white"
                    >
                      "{search}" ×
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-1 text-xs font-medium text-[#666666] underline underline-offset-4"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {loading ? (
                <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="animate-pulse"
                      >
                        <div className="aspect-[4/5] rounded-[24px] bg-[#ecece7]" />

                        <div className="pt-4">
                          <div className="h-3 w-20 rounded bg-black/10" />

                          <div className="mt-2 h-5 w-32 rounded bg-black/10" />

                          <div className="mt-2 h-4 w-20 rounded bg-black/10" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : products.length > 0 ? (
                <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={{
                        ...product,
                        id: product._id,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-[28px] border border-dashed border-[var(--border)] bg-white px-6 py-20 text-center">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                    No products found
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                    Try changing your search or filter
                    options.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525]"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

