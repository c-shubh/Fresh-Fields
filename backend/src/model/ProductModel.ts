import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";
import { InferType, ObjectSchema, number, object, string } from "yup";
import { OmitStrict, Overwrite } from "../types";
import { WithId } from "../utils";

const productModelSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  // User: productsCreated[], Product: ownerId
  ownerId: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
});

["toJSON", "toObject"].forEach((key) =>
  productModelSchema.set(key as any, {
    transform(doc: any, ret: any, opt: any) {
      delete ret["__v"];
      return ret;
    },
  })
);

productModelSchema.index({ productName: "text", description: "text" });

export const productModel = mongoose.model("Product", productModelSchema);

type ProductModelSchema = InferSchemaType<typeof productModelSchema>;
export type Product = WithId<ProductModelSchema>;
export type ProductJson = Overwrite<Product, { _id: string; ownerId: string }>;

const createProductValidator: ObjectSchema<
  OmitStrict<ProductModelSchema, "ownerId">
> = object({
  imageUrl: string().url().required(),
  productName: string().required(),
  price: number().required(),
  description: string().required(),
  quantity: number().required(),
});

export type CreateProductSchema = InferType<typeof createProductValidator>;

const patchProductValidator: ObjectSchema<
  Partial<OmitStrict<ProductModelSchema, "ownerId">>
> = object({
  imageUrl: string().url(),
  productName: string(),
  price: number(),
  description: string(),
  quantity: number(),
});

export type PatchProductSchema = InferType<typeof patchProductValidator>;

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
