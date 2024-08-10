import { Router } from "express";
import { ApiError } from "../error";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { CartItem, CartItemJson, cartItemModel } from "../model/CartItem";
import { ProductJson, productModel } from "../model/ProductModel";
import {
  CartAddItemSchemaJson,
  userModel,
  validators,
} from "../model/UserModel";
import { ApiType, Overwrite, ResponseBody, UserRole } from "../types";
import { HttpStatusCode } from "../utils";

export const cartRouter = Router();

export interface CartApiTypes {
  addOneProduct: ApiType<CartAddItemSchemaJson, ResponseBody<null>>;
  getAllProducts: ApiType<
    null,
    ResponseBody<Overwrite<CartItemJson, { product: ProductJson }>[]>
  >;
  removeOneProduct: ApiType<null, ResponseBody<null>>;
}

/* Add product to logged in user's cart */
cartRouter.post(
  "/",
  authenticate(UserRole.user),
  asyncHandler(async (req, res) => {
    const { productId } = validators.cartAddItem.validateSync(req.body);

    const { user } = res.locals;
    const product = await productModel.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    const foundUser = (await userModel.findById(user._id))!;

    // ALERT: type check populate path
    const populatedCart = await foundUser.populate<{
      cart: CartItem[];
    }>("cart");

    const ret: CartApiTypes["addOneProduct"]["response"] = {
      data: null,
      error: null,
    };

    for (let i = 0; i < populatedCart.cart.length; i++) {
      // find the product in the cart
      if (populatedCart.cart[i].product.equals(productId)) {
        // increment count
        await cartItemModel.updateOne(
          { _id: populatedCart.cart[i]._id },
          { count: populatedCart.cart[i].count + 1 }
        );
        return res.status(HttpStatusCode.Ok).json(ret);
      }
    }

    // if product not found in cart, add it
    const newCartItem = await cartItemModel.create({
      product: productId,
      count: 1,
    });

    foundUser.cart.push(newCartItem._id);
    await foundUser.save();
    return res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Get user's cart */
cartRouter.get(
  "/",
  authenticate(UserRole.user),
  asyncHandler(async (req, res) => {
    const { user } = res.locals;
    const foundUser = (await userModel.findById(user._id))!;
    // ALERT: type check populate path
    const populatedUser = await foundUser.populate<{
      cart: Overwrite<CartItemJson, { product: ProductJson }>[];
    }>({
      path: "cart",
      populate: "product",
    });

    const ret: CartApiTypes["getAllProducts"]["response"] = {
      error: null,
      data: populatedUser.cart,
    };

    return res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Remove product from cart */
cartRouter.delete(
  "/:productId",
  authenticate(UserRole.user),
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { user } = res.locals;
    const foundUser = (await userModel.findById(user._id))!;

    // ALERT: type check populate path
    const populatedCart = await foundUser.populate<{
      cart: CartItem[];
    }>("cart");

    for (let i = 0; i < populatedCart.cart.length; i++) {
      // find the product in the cart
      if (populatedCart.cart[i].product.equals(productId)) {
        // decrement count
        if (populatedCart.cart[i].count - 1 <= 0) {
          // delete cart item
          await cartItemModel.deleteOne({ _id: populatedCart.cart[i]._id });
          // remove it from user's cart
          await userModel.updateOne(
            { _id: foundUser._id },
            {
              $pull: { cart: populatedCart.cart[i]._id },
            }
          );
        } else {
          await cartItemModel.updateOne(
            { _id: populatedCart.cart[i]._id },
            { count: populatedCart.cart[i].count - 1 }
          );
        }
        const ret: CartApiTypes["removeOneProduct"]["response"] = {
          data: null,
          error: null,
        };
        return res.status(HttpStatusCode.Ok).json(ret);
      }
    }
    const ret: CartApiTypes["removeOneProduct"]["response"] = {
      data: null,
      error: "Product not found in cart",
    };
    return res.status(HttpStatusCode.NotFound).json(ret);
  })
);
