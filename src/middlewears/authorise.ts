import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/authServices";
import { checkUserNotExist } from "../utils/auth";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const authorise = async (permission: boolean, ...roles: string[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const user = await getUserById(userId!);

    checkUserNotExist(user);

    // check roles include in
    const result = roles.includes(user!.role);
    if (permission && result) {
    }
    next();
  };
};
