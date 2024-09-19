import { Schema, Types, model } from "mongoose";
import { InferType, ObjectSchema, number, object, string } from "yup";
import { OmitStrict, Overwrite } from "../types";
import { Product, SerializedProduct, serializeProduct } from "./ProductModel";

interface CartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
}

type PopulatedCartItem = Overwrite<CartItem, { product: Product }>;

type SerializedCartItem = Overwrite<
  CartItem,
  {
    _id: string;
    product: SerializedProduct;
  }
>;

export function serializeCartItem(
  populatedCartItem: PopulatedCartItem
): SerializedCartItem {
  return {
    _id: populatedCartItem._id.toString(),
    product: serializeProduct(populatedCartItem.product),
    quantity: populatedCartItem.quantity,
  };
}

interface Cart {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  items: CartItem[];
}

type SerializedCart = Overwrite<
  Cart,
  {
    _id: string;
    buyer: string;
    items: SerializedCartItem[];
  }
>;

type PopulatedCart = Overwrite<Cart, { items: PopulatedCartItem[] }>;

export function serializeCart(cart: PopulatedCart): SerializedCart {
  return {
    _id: cart._id.toString(),
    buyer: cart.buyer.toString(),
    items: cart.items.map(serializeCartItem), // Serialize each CartItem
  };
}

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

const cartSchema = new Schema({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: {
    type: [cartItemSchema],
    required: true,
  },
});

export const cartModel = model("Cart", cartSchema);

const cartAddItemValidator: ObjectSchema<
  Overwrite<OmitStrict<CartItem, "_id">, { product: string }>
> = object({
  product: string().required(),
  quantity: number().min(1).required(),
});

type NewCartItem = InferType<typeof cartAddItemValidator>;

export const validators = {
  cartAddItem: cartAddItemValidator,
};

export type { Cart, CartItem, NewCartItem, PopulatedCart, SerializedCart };
