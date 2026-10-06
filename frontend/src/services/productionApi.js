import { api } from "../lib/axios";

export const getProducts = async (params = {}) => {
  const response = await api.get("/api/products", {
    params,
  });

  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/api/products/${id}`);

  return response.data;
};