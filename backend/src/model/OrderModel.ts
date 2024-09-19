import { Schema, Types, model } from "mongoose";
import { Overwrite } from "../types";
import { Product, SerializedProduct, serializeProduct } from "./ProductModel";

interface OrderItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  price: number; // Price at the time of the order
}

type PopulatedOrderItem = Overwrite<OrderItem, { product: Product }>;

type SerializedOrderItem = Overwrite<
  OrderItem,
  {
    _id: string;
    product: SerializedProduct;
  }
>;

export function serializeOrderItem(
  populatedOrderItem: PopulatedOrderItem
): SerializedOrderItem {
  return {
    _id: populatedOrderItem._id.toString(),
    product: serializeProduct(populatedOrderItem.product),
    quantity: populatedOrderItem.quantity,
    price: populatedOrderItem.price,
  };
}

interface Order {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}

type SerializedOrder = Overwrite<
  Order,
  {
    _id: string;
    buyer: string;
    items: SerializedOrderItem[];
    createdAt: string;
  }
>;

type PopulatedOrder = Overwrite<Order, { items: PopulatedOrderItem[] }>;

export function serializeOrder(cart: PopulatedOrder): SerializedOrder {
  return {
    _id: cart._id.toString(),
    buyer: cart.buyer.toString(),
    items: cart.items.map(serializeOrderItem), // Serialize each OrderItem
    totalAmount: cart.totalAmount,
    status: cart.status,
    createdAt: cart.createdAt.toISOString(),
  };
}

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const orderModel = model("Order", orderSchema);

export type { SerializedOrder, PopulatedOrder };
