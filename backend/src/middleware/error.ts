import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { MongoServerError } from "mongodb";
import { Logger } from "../Logger";
import { ApiError } from "../error";
import { ResponseBody } from "../types";
import { HttpStatusCode } from "../utils";

enum MongoServerErrorCode {
  DuplicateKey = 11000,
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const logger = new Logger("errorHandler");
  logger.error(err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof MongoServerError) {
    switch (err.code) {
      case MongoServerErrorCode.DuplicateKey: {
        const ret: ResponseBody<null> = {
          data: null,
          error: "User already exists",
        };
        return res.status(HttpStatusCode.BadRequest).json(ret);
      }
    }
  }
  const ret: ResponseBody<null> = {
    data: null,
    error: (err as Error).message,
  };
  res.status(HttpStatusCode.InternalServerError).json(ret);

  req;
  next;
};

export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
