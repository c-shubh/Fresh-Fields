import { Router } from "express";
import { HydratedDocument } from "mongoose";
import { ApiError } from "../error";
import { AuthenticatedResponse, authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import {
  NewCartItem,
  PopulatedCart,
  SerializedCart,
  cartModel,
  serializeCart,
  validators,
} from "../model/CartModel";
import { productModel } from "../model/ProductModel";
import { User } from "../model/UserModel";
import { ApiType, ResponseBody, UserRole } from "../types";
import { HttpStatusCode } from "../utils";

export const cartRouter = Router();

export interface CartApiTypes {
  addOneProduct: ApiType<NewCartItem, ResponseBody<null>>;
  getCart: ApiType<null, ResponseBody<SerializedCart>>;
  removeOneProduct: ApiType<null, ResponseBody<null>>;
  clearCart: ApiType<null, ResponseBody<null>>;
}

async function checkAndCreateCart(user: HydratedDocument<User>) {
  const cart = await cartModel.findOne({
    buyer: user._id,
  });
  if (cart) return cart;
  return await cartModel.create({ buyer: user._id, items: [] });
}

/* Add product to logged in user's cart */
cartRouter.post(
  "/",
  authenticate(UserRole.buyer),
  asyncHandler(async (req, res) => {
    const { user } = (res as AuthenticatedResponse).locals;
    const { product: productId, quantity } =
      validators.cartAddItem.validateSync(req.body);
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    // check if user has a cart
    const userCart = await checkAndCreateCart(user);
    const populatedCart = await userCart.populate({
      // ALERT: type check populate path
      path: "items.product",
      model: "Product",
    });
    console.log("populated cart");
    console.log(populatedCart.toObject());
    // check if current product id is already present
    const existingCartItem = populatedCart.items.find((item) =>
      item.product._id.equals(productId)
    );
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      populatedCart.items.push({ product: productId, quantity });
    }
    await populatedCart.save();

    const ret: CartApiTypes["addOneProduct"]["response"] = {
      data: null,
      error: null,
    };

    return res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Get user's cart */
cartRouter.get(
  "/",
  authenticate(UserRole.buyer),
  asyncHandler(async (req, res) => {
    const { user } = (res as AuthenticatedResponse).locals;
    const userCart = await checkAndCreateCart(user);
    const populatedCart = await userCart.populate<PopulatedCart>({
      // ALERT: type check populate path
      path: "items.product",
      model: "Product",
    });

    const ret: CartApiTypes["getCart"]["response"] = {
      error: null,
      data: serializeCart(populatedCart),
    };

    return res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Clear all items from cart */
cartRouter.delete(
  "/",
  authenticate(UserRole.buyer),
  asyncHandler(async (req, res) => {
    const { user } = (res as AuthenticatedResponse).locals;
    const userCart = await cartModel.findOne({ buyer: user._id });
    if (!userCart) {
      throw new ApiError(404, "Cart not found");
    }
    // Clear the cart items
    userCart.items.splice(0, userCart.items.length);
    await userCart.save();

    const response = {
      data: null,
      error: null,
    };

    return res.status(HttpStatusCode.Ok).json(response);
  })
);

/* Remove product from cart */
cartRouter.delete(
  "/:productId",
  authenticate(UserRole.buyer),
  asyncHandler(async (req, res) => {
    const { user } = (res as AuthenticatedResponse).locals;
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    const userCart = await checkAndCreateCart(user);
    const populatedCart = await userCart.populate<PopulatedCart>({
      path: "items.product",
      model: "Product",
    });
    const existingCartItem = populatedCart.items.find((item) =>
      item.product._id.equals(productId)
    );

    if (!existingCartItem) {
      throw new ApiError(404, "Product not found in cart");
    }

    // Decrement the quantity
    existingCartItem.quantity -= 1;

    if (existingCartItem.quantity <= 0) {
      // Remove the item from the cart if quantity is zero or less
      populatedCart.items = populatedCart.items.filter(
        (item) => !item.product._id.equals(productId)
      );
    }

    // Save the updated cart
    await populatedCart.save();

    const ret: CartApiTypes["removeOneProduct"]["response"] = {
      data: null,
      error: null,
    };

    return res.status(HttpStatusCode.Ok).json(ret);
  })
);
