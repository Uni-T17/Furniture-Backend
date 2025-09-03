import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const register = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone Number Must Be 5-12 numbers"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      const error: any = new Error(errors[0]?.msg);
      error.status = 400;
      error.code = "Error_Invalid";
      return next(error);
    }
    res.status(200).json({
      message: "register",
    });
  },
];

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: "register",
  });
};
export const confirmPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: "register",
  });
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: "register",
  });
};
