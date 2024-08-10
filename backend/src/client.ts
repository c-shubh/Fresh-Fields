import type { AxiosInstance } from "axios";
import type { AuthApiTypes } from "./controller/auth";
import type { CartApiTypes } from "./controller/cart";
import type { ProductApiTypes } from "./controller/product";

export class ApiClient {
  constructor(private client: AxiosInstance) {}

  static bearerToken(token: string) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  /* --------------------------------- Auth --------------------------------- */

  signup = async (data: AuthApiTypes["signup"]["request"]) =>
    await this.client.post<AuthApiTypes["signup"]["response"]>(
      "/auth/signup",
      data
    );

  login = async (data: AuthApiTypes["login"]["request"]) =>
    await this.client.post<AuthApiTypes["login"]["response"]>(
      "/auth/login",
      data
    );

  /* ------------------------------- Product -------------------------------- */

  createProduct = async (
    data: ProductApiTypes["create"]["request"],
    token: string
  ) =>
    await this.client.post<ProductApiTypes["create"]["response"]>(
      "/product",
      data,
      ApiClient.bearerToken(token)
    );

  getAllProducts = async () =>
    await this.client.get<ProductApiTypes["getAll"]["response"]>("/product");

  getOneProduct = async (id: string) =>
    await this.client.get<ProductApiTypes["getOne"]["response"]>(
      `/product/${id}`
    );

  updateOneProduct = async (
    id: string,
    data: ProductApiTypes["updateOne"]["request"],
    token: string
  ) =>
    await this.client.patch<ProductApiTypes["updateOne"]["response"]>(
      `/product/${id}`,
      data,
      ApiClient.bearerToken(token)
    );

  deleteOneProduct = async (id: string, token: string) =>
    await this.client.delete<ProductApiTypes["deleteOne"]["response"]>(
      `/product/${id}`,
      ApiClient.bearerToken(token)
    );

  search = async (data: ProductApiTypes["search"]["request"]) =>
    await this.client.post<ProductApiTypes["search"]["response"]>(
      "/product/search",
      data
    );

  /* --------------------------------- Cart --------------------------------- */

  addOneProductToCart = async (
    data: CartApiTypes["addOneProduct"]["request"],
    token: string
  ) =>
    await this.client.post<CartApiTypes["addOneProduct"]["response"]>(
      `/cart`,
      data,
      ApiClient.bearerToken(token)
    );

  getAllProductsFromCart = async (token: string) =>
    await this.client.get<CartApiTypes["getAllProducts"]["response"]>(
      "/cart",
      ApiClient.bearerToken(token)
    );

  removeOneProductFromCart = async (productId: string, token: string) =>
    await this.client.delete<CartApiTypes["removeOneProduct"]["response"]>(
      `/cart/${productId}`,
      ApiClient.bearerToken(token)
    );
}
