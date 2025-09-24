import { Request, Response, NextFunction } from "express";
import { getUserById } from "../../services/authServices";
import { createError, errorCode } from "../../utils/error";
import { isAuthorise } from "../../utils/authorise";
import { checkUserNotExist } from "../../utils/auth";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const getAllUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  res.status(200).json({
    message: req.t("Welcome"),
    userRole: user.role,
  });
};

export const testPermission = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = await getUserById(userId!);

  const info: any = {
    title: "test permission",
  };

  const isAllow = isAuthorise(true, user!.role, "AUTHOR");
  if (isAllow) {
    info.content = "You are an AUTHOR";
  }

  res.status(200).json({
    info,
  });
};
