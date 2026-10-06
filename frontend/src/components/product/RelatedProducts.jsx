import ProductCard from "./ProductCard";

export default async function RelatedProducts({
  currentProductId,
}) {
  let relatedProducts = [];

  try {
    const productResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${currentProductId}`,
      {
        cache: "no-store",
      }
    );

    if (productResponse.ok) {
      const productResult =
        await productResponse.json();

      const currentProduct =
        productResult.data;

      const categorySlug =
        currentProduct?.category?.slug;

      if (categorySlug) {
        const relatedResponse =
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${encodeURIComponent(
              categorySlug
            )}&sort=rating&limit=8`,
            {
              cache: "no-store",
            }
          );

        if (relatedResponse.ok) {
          const relatedResult =
            await relatedResponse.json();

          const products =
            relatedResult.data || [];

          relatedProducts = products
            .filter(
              (product) =>
                product._id !==
                currentProductId
            )
            .slice(0, 4)
            .map((product) => ({
              id: product._id,
              name: product.name,
              slug: product.slug,
              image:
                product.images?.[0] || "",
              images:
                product.images || [],
              price: product.price,
              oldPrice:
                product.comparePrice,
              category:
                product.category?.name,
              rating: product.rating,
              reviews:
                product.reviewCount,
              badge: product.isFeatured
                ? "Featured"
                : null,
              stock: product.stock,
              description:
                product.description,
              colors:
                product.colors || [],
              sizes:
                product.sizes || [],
            }));
        }
      }
    }
  } catch (error) {
    console.error(
      "Related products error:",
      error
    );
  }

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <section className="container-main section-space-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          You may also like
        </p>

        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Related products
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
        {relatedProducts.map(
          (product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          )
        )}
      </div>
    </section>
  );
}

