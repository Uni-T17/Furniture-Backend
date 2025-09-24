import { Request, Response, NextFunction } from "express";
import { getUserById } from "../../services/authServices";
import { createError, errorCode } from "../../utils/error";

interface CustomRequest extends Request {
  userId?: number;
}

export const getAllUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await getUserById(req.userId!);
  if (user?.role !== "ADMIN") {
    return next(
      createError("You are not an ADMIN", 401, errorCode.unauthorised)
    );
  }
  res.status(200).json({
    message: req.t("Welcome"),
    userId: req.userId,
  });
};
