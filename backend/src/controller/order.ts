import { Router } from "express";
import { ApiError } from "../error";
import { AuthenticatedResponse, authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { PopulatedCart, cartModel } from "../model/CartModel";
import {
  PopulatedOrder,
  SerializedOrder,
  orderModel,
  serializeOrder,
} from "../model/OrderModel";
import { ApiType, ResponseBody, UserRole } from "../types";
import { HttpStatusCode } from "../utils";

export const orderRouter = Router();

export interface OrderApiTypes {
  newOrder: ApiType<null, ResponseBody<SerializedOrder>>;
  getOrders: ApiType<null, ResponseBody<SerializedOrder[]>>;
  updateOrder: ApiType<{ status: string }, ResponseBody<null>>;
  cancelOrder: ApiType<null, ResponseBody<null>>;
}

/* Create a new order */
orderRouter.post(
  "/",
  authenticate(UserRole.buyer),
  asyncHandler(async (req, res) => {
    const { user } = (res as AuthenticatedResponse).locals;

    // Get the user's cart
    const userCart = await cartModel
      .findOne({ buyer: user._id })
      // ALERT: type check populate path
      .populate<PopulatedCart>({ path: "items.product", model: "Product" });

    if (!userCart || userCart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty.");
    }

    // Calculate total amount
    const totalAmount = userCart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    // Create order items
    const orderItems = userCart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price, // Record price at time of order
    }));

    // Create new order
    const newOrder = await orderModel.create({
      buyer: user._id,
      items: orderItems,
      totalAmount,
      status: "pending",
    });

    const populatedOrder = await newOrder.populate<PopulatedOrder>({
      // ALERT: type check populate path
      path: "items.product",
      model: "Product",
    });

    // Clear the cart after creating the order
    userCart.items = [];
    await userCart.save();

    const ret: OrderApiTypes["newOrder"]["response"] = {
      error: null,
      data: serializeOrder(populatedOrder),
    };

    res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Get a user's orders */
orderRouter.get(
  "/",
  authenticate(UserRole.buyer),
  asyncHandler(async (req, res) => {
    const { user } = (res as AuthenticatedResponse).locals;

    const userOrders = await orderModel
      .find({ buyer: user._id })
      .populate<PopulatedOrder>(
        // ALERT: type check populate path
        { path: "items.product", model: "Product" }
      );

    const ret: OrderApiTypes["getOrders"]["response"] = {
      error: null,
      data: userOrders.length === 0 ? [] : userOrders.map(serializeOrder),
    };

    res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Update order status */
orderRouter.put(
  "/:orderId/status",
  authenticate(UserRole.admin),
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status");
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const ret: OrderApiTypes["updateOrder"]["response"] = {
      error: null,
      data: null,
    };

    res.status(HttpStatusCode.Ok).json(ret);
  })
);

/* Cancel an order */
orderRouter.put(
  "/:orderId/cancel",
  authenticate(UserRole.buyer),
  asyncHandler(async (req, res) => {
    const { user } = (res as AuthenticatedResponse).locals;
    const { orderId } = req.params;

    const order = await orderModel.findOne({ _id: orderId, buyer: user._id });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.status !== "pending") {
      throw new ApiError(400, "Only pending orders can be cancelled");
    }

    order.status = "cancelled";
    await order.save();

    const ret: OrderApiTypes["cancelOrder"]["response"] = {
      error: null,
      data: null,
    };

    res.status(HttpStatusCode.Ok).json(ret);
  })
);
