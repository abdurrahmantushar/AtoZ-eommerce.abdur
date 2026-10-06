import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWishlistStore = create(
  persist(
    (set) => ({
      items: [],

      addToWishlist: (product) => {
        set((state) => {
          const exists = state.items.some(
            (item) => item.id === product.id
          );

          if (exists) {
            return state;
          }

          return {
            items: [...state.items, product],
          };
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== productId
          ),
        }));
      },

      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.some(
            (item) => item.id === product.id
          );

          return {
            items: exists
              ? state.items.filter(
                  (item) => item.id !== product.id
                )
              : [...state.items, product],
          };
        });
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "atoz-wishlist",
    }
  )
);

export default useWishlistStore;