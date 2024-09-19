import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../error";
import { asyncHandler } from "../middleware/error";
import {
  LoginUserSchema,
  NewUser,
  SerializedUser,
  serializeUser,
  userModel,
  validators,
} from "../model/UserModel";
import { ApiType, ResponseBody } from "../types";
import { HttpStatusCode } from "../utils";

export const authRouter = Router();

export interface AuthApiTypes {
  signup: ApiType<NewUser, ResponseBody<null>>;
  login: ApiType<LoginUserSchema, ResponseBody<LoginResponse>>;
}

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const user = validators.createUser.validateSync(req.body);
    const { password, ...userWithoutPassword } = user;
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    await userModel.create({
      ...userWithoutPassword,
      password: hashedPassword,
    } satisfies NewUser);
    const ret: AuthApiTypes["signup"]["response"] = {
      error: null,
      data: null,
    };
    res.status(HttpStatusCode.Created).json(ret);
  })
);

export interface LoginResponse {
  token: string;
  user: SerializedUser;
}

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const credentials = validators.loginUser.validateSync(req.body);
    const user = await userModel.findOne({ email: credentials.email });
    if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
      throw new ApiError(401, "Invalid credentials");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("env JWT_SECRET not set");
    }

    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: "7d",
    });

    const ret: AuthApiTypes["login"]["response"] = {
      error: null,
      data: {
        token,
        user: serializeUser(user),
      },
    };

    res.status(HttpStatusCode.Ok).json(ret);
  })
);
