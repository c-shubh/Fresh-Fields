import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";
import { Overwrite } from "../types";
import { WithId } from "../utils";

const cartItemModelSchema = new mongoose.Schema({
  product: { type: SchemaTypes.ObjectId, ref: "Product", required: true },
  count: { type: Number, required: true },
});

["toJSON", "toObject"].forEach((key) =>
  cartItemModelSchema.set(key as any, {
    transform(doc: any, ret: any, opt: any) {
      delete ret["__v"];
      return ret;
    },
  })
);

export const cartItemModel = mongoose.model("CartItem", cartItemModelSchema);

type CartItemModelSchema = InferSchemaType<typeof cartItemModelSchema>;
export type CartItem = WithId<CartItemModelSchema>;
export type CartItemJson = Overwrite<
  CartItem,
  { _id: string; product: string }
>;
