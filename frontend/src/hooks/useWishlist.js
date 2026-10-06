import useWishlistStore from "@/store/wishlistStore";

export default function useWishlist() {
  const items = useWishlistStore((state) => state.items);
  const addToWishlist = useWishlistStore(
    (state) => state.addToWishlist
  );
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist
  );
  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist
  );
  const clearWishlist = useWishlistStore(
    (state) => state.clearWishlist
  );

  const isWishlisted = (productId) =>
    items.some((item) => item.id === productId);

  return {
    items,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isWishlisted,
    totalItems: items.length,
  };
}