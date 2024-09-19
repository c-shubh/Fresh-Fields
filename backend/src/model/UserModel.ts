import mongoose, { Types } from "mongoose";
import { InferType, ObjectSchema, object, string } from "yup";
import { OmitStrict, Overwrite, UserRole } from "../types";

interface User {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  mobileNumber: string;
  // TODO: type safety for role, remove public
  role: "buyer" | "seller" | "admin" | "public";
}

type SerializedUser = Overwrite<OmitStrict<User, "password">, { _id: string }>;

export function serializeUser<T extends User>(user: T): SerializedUser {
  return {
    _id: user._id.toHexString(),
    email: user.email,
    mobileNumber: user.mobileNumber,
    name: user.name,
    role: user.role,
  };
}

const userModelSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true, unique: false },
  mobileNumber: { type: String, required: true, unique: true },
  // TODO: type safety for role enum
  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    required: true,
  },
});

export const userModel = mongoose.model("User", userModelSchema);

/* ------------------------------- validation ------------------------------- */

const createUserValidator: ObjectSchema<OmitStrict<User, "_id">> = object({
  email: string().email().required(),
  password: string().required(),
  name: string().required(),
  mobileNumber: string().required(),
  role: string()
    .oneOf(Object.values(UserRole).filter((ele) => ele !== UserRole.public))
    .required(),
});

type NewUser = InferType<typeof createUserValidator>;

const loginUserValidator = object({
  email: string().email().required(),
  password: string().required(),
});

type LoginUserSchema = InferType<typeof loginUserValidator>;

export const validators = {
  createUser: createUserValidator,
  loginUser: loginUserValidator,
};

export type { User, LoginUserSchema, NewUser, SerializedUser };
