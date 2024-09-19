import mongoose, { SchemaTypes, Types, Document } from "mongoose";
import { InferType, ObjectSchema, number, object, string } from "yup";
import { OmitStrict, Overwrite } from "../types";

interface Product {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  seller: Types.ObjectId;
  imageUrl: string;
  quantity: number;
  units: string;
}

type SerializedProduct = Overwrite<
  Product,
  {
    _id: string;
    seller: string;
  }
>;

export function serializeProduct<T extends Product>(
  product: T
): SerializedProduct {
  return {
    _id: product._id.toHexString(),
    name: product.name,
    description: product.description,
    price: product.price,
    seller: product.seller.toHexString(),
    imageUrl: product.imageUrl,
    quantity: product.quantity,
    units: product.units,
  };
}

const productModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  seller: { type: SchemaTypes.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, required: true },
  quantity: { type: Number, required: true },
  // kg, g, etc.
  units: { type: String, required: true },
});

// TODO: make the argument type-safe
productModelSchema.index({ name: "text", description: "text" });

export const productModel = mongoose.model("Product", productModelSchema);

const createProductValidator: ObjectSchema<
  OmitStrict<Product, "_id" | "seller">
> = object({
  imageUrl: string().url().required(),
  name: string().required(),
  price: number().required(),
  description: string().required(),
  quantity: number().required(),
  units: string().required(),
});

type NewProduct = InferType<typeof createProductValidator>;

const patchProductValidator: ObjectSchema<
  Partial<OmitStrict<Product, "seller" | "_id">>
> = object({
  imageUrl: string().url(),
  name: string(),
  price: number(),
  description: string(),
  quantity: number(),
  units: string(),
});

type UpdateProduct = InferType<typeof patchProductValidator>;

const searchProductValidator: ObjectSchema<{
  q: string;
}> = object({
  q: string().required("Please enter a query"),
});

export const validators = {
  createProduct: createProductValidator,
  patchProduct: patchProductValidator,
  searchProduct: searchProductValidator,
};

export type { Product, SerializedProduct, NewProduct, UpdateProduct };
