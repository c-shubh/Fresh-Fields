import { Request, Router } from "express";
import { ApiError } from "../error";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import {
  CreateProductSchema,
  PatchProductSchema,
  ProductJson,
  productModel,
  validators,
} from "../model/ProductModel";
import { userModel } from "../model/UserModel";
import { ApiType, ResponseBody, UserRole } from "../types";
import { HttpStatusCode } from "../utils";

export const productRouter = Router();

export interface ProductApiTypes {
  create: ApiType<CreateProductSchema, ResponseBody<ProductJson>>;
  getAll: ApiType<null, ResponseBody<ProductJson[]>>;
  getOne: ApiType<null, ResponseBody<ProductJson>>;
  updateOne: ApiType<PatchProductSchema, ResponseBody<ProductJson>>;
  deleteOne: ApiType<string, ResponseBody<null>>;
  search: ApiType<{ q: string }, ResponseBody<ProductJson[]>>;
}

/* Create a product */
productRouter.post(
  "/",
  authenticate(UserRole.seller),
  asyncHandler(async (req: Request, res) => {
    const product = validators.createProduct.validateSync(req.body);
    const createdProduct = await productModel.create({
      ...product,
      ownerId: res.locals.user._id,
    });
    await userModel.findByIdAndUpdate(res.locals.user._id, {
      $push: {
        productsCreated: createdProduct._id,
      },
    });
    const ret: ProductApiTypes["create"]["response"] = {
      error: null,
      data: createdProduct.toJSON(),
    };
    return res.status(HttpStatusCode.Created).json(ret);
  })
);

/* Read all products */
productRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await productModel.find();
    const ret: ProductApiTypes["getAll"]["response"] = {
      error: null,
      data: products.map((product) => product.toJSON()),
    };
    res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Read a product */
productRouter.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(HttpStatusCode.NotFound, "Product not found");
    }
    const ret: ProductApiTypes["getOne"]["response"] = {
      error: null,
      data: product.toJSON(),
    };
    res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Update a product */
productRouter.patch(
  "/:productId",
  authenticate(UserRole.seller),
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { user } = res.locals;
    const patch = validators.patchProduct.validateSync(req.body);
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(HttpStatusCode.NotFound, "Product not found");
    }
    if (!product.ownerId.equals(user._id)) {
      throw new ApiError(HttpStatusCode.Unauthorized, "Unauthorized");
    }
    product.set(patch);
    await product.save();
    const ret: ProductApiTypes["updateOne"]["response"] = {
      error: null,
      data: product.toJSON(),
    };
    return res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Delete a product */
productRouter.delete(
  "/:productId",
  authenticate(UserRole.seller),
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { user } = res.locals;
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(HttpStatusCode.NotFound, "Product not found");
    }
    if (!product.ownerId.equals(user._id)) {
      throw new ApiError(HttpStatusCode.Unauthorized, "Unauthorized");
    }
    await product.deleteOne();
    const ret: ProductApiTypes["deleteOne"]["response"] = {
      error: null,
      data: null,
    };

    return res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Search products */
productRouter.post(
  "/search",
  asyncHandler(async (req, res) => {
    const body = validators.searchProduct.validateSync(req.body);
    const searchQuery = body.q;
    const products = await productModel
      .find({ $text: { $search: searchQuery } })
      .exec();
    const ret: ProductApiTypes["search"]["response"] = {
      error: null,
      data: products.map((p) => p.toJSON()),
    };
    res.json(ret);
  })
);
