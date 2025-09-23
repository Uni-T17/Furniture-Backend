import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  userId?: number;
}

export const getAllUsers = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: req.t("Welcome"),
    userId: req.userId,
  });
};
