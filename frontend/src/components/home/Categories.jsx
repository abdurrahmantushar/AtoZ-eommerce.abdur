
import Link from "next/link";
import {
  ArrowUpRight,
  Dumbbell,
  Headphones,
  House,
  Sparkles,
  ShoppingBasket,
  Shirt,
  Smartphone,
  Watch,
} from "lucide-react";

const categoryStyles = {
  electronics: {
    icon: Smartphone,
    className: "bg-[#dfe7f1]",
  },

  fashion: {
    icon: Shirt,
    className: "bg-[#e8ddd4]",
  },

  beauty: {
    icon: Sparkles,
    className: "bg-[#eadfe8]",
  },

  home: {
    icon: House,
    className: "bg-[#ddd9cc]",
  },

  grocery: {
    icon: ShoppingBasket,
    className: "bg-[#dfe7d8]",
  },

  sports: {
    icon: Dumbbell,
    className: "bg-[#dddfe8]",
  },

  accessories: {
    icon: Watch,
    className: "bg-[#e7ddd1]",
  },

  audio: {
    icon: Headphones,
    className: "bg-[#d9e2e5]",
  },
};

async function getCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const result = await response.json();

    return result.data || [];
  } catch (error) {
    console.error("Categories fetch error:", error);

    return [];
  }
}

export default async function Categories() {
  const categories = await getCategories();

  return (
    <section className="container-main section-space-sm">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            Explore the world of AtoZ
          </p>

          <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Shop by category
          </h2>
        </div>

        <Link
          href="/categories"
          className="group inline-flex w-fit items-center gap-2 text-sm font-medium"
        >
          View all categories

          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight size={15} strokeWidth={1.8} />
          </span>
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.length > 0 ? (
          categories.map((category) => {
            const style =
              categoryStyles[category.slug] || {
                icon: ShoppingBasket,
                className: "bg-[#e5e5e0]",
              };

            const Icon = style.icon;

            return (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className={`group relative min-h-[220px] overflow-hidden rounded-[24px] p-5 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[260px] lg:min-h-[300px] ${style.className}`}
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm">
                    <Icon
                      size={20}
                      strokeWidth={1.6}
                    />
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.8}
                      className="transition-transform duration-300 group-hover:rotate-45"
                    />
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-xs text-black/50">
                    Discover collection
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-10 text-center text-sm text-[var(--muted)]">
            No categories available.
          </div>
        )}
      </div>
    </section>
  );
}

