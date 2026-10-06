import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      addToCart: (product, quantity = 1, options = {}) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.id === product.id &&
              item.selectedColor === options.selectedColor &&
              item.selectedSize === options.selectedSize
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id &&
                item.selectedColor === options.selectedColor &&
                item.selectedSize === options.selectedSize
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity,
                selectedColor: options.selectedColor || "",
                selectedSize: options.selectedSize || "",
              },
            ],
          };
        });
      },

      removeFromCart: (productId, selectedColor = "", selectedSize = "") => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.id === productId &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
              )
          ),
        }));
      },

      updateQuantity: (
        productId,
        quantity,
        selectedColor = "",
        selectedSize = ""
      ) => {
        if (quantity < 1) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
              ? {
                  ...item,
                  quantity,
                }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "atoz-cart",
    }
  )
);

export default useCartStore;