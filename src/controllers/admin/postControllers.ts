import { Request, Response, NextFunction } from "express";
import { createError, errorCode } from "../../utils/error";
import { body, validationResult } from "express-validator";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createPost = [
  body("", ""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return createError(errors[0]?.msg, 404, errorCode.invalid);
    }

    res.status(200).json({ message: "OK" });
  },
];

export const updatePost = [
  body("", ""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return createError(errors[0]?.msg, 404, errorCode.invalid);
    }

    res.status(200).json({ message: "OK" });
  },
];

export const deletePost = [
  body("", ""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return createError(errors[0]?.msg, 404, errorCode.invalid);
    }

    res.status(200).json({ message: "OK" });
  },
];
