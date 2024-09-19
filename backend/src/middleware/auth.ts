import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../error";
import { User, userModel } from "../model/UserModel";
import { UserRole } from "../types";
import { HttpStatusCode } from "../utils";
import { HydratedDocument } from "mongoose";

export interface AuthenticatedLocal {
  user: HydratedDocument<User>;
}

export interface AuthenticatedResponse
  extends Response<unknown, AuthenticatedLocal> {}

export const authenticate = function (...roles: UserRole[]) {
  return function (
    req: Request,
    res: AuthenticatedResponse,
    next: NextFunction
  ) {
    const authHeader = req.headers["authorization"];
    const isPublic = roles.includes(UserRole.public);
    if (!authHeader) {
      if (isPublic) return next();
      throw new ApiError(HttpStatusCode.Unauthorized, "Unauthorized");
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (isPublic) return next();
      throw new Error("env JWT_SECRET not set");
    }
    jwt.verify(token, secret, async (err, payload) => {
      if (err || !payload) {
        if (isPublic) return next();
        return res
          .status(HttpStatusCode.Unauthorized)
          .json({ error: "Unauthorized" });
      }
      const userId = (payload as jwt.JwtPayload & { userId: string }).userId;
      const foundUser = await userModel.findById(userId);
      if (!foundUser || !roles.includes(foundUser.role as UserRole)) {
        if (isPublic) return next();
        return res
          .status(HttpStatusCode.Unauthorized)
          .json({ error: "Unauthorized" });
      }
      res.locals.user = foundUser;
      next();
    });
  };
};
