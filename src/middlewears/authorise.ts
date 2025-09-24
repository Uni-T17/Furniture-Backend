import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/authServices";
import { checkUserNotExist } from "../utils/auth";
import { createError, errorCode } from "../utils/error";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const authorise = (permission: boolean, ...roles: string[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const user = await getUserById(userId!);

    checkUserNotExist(user);

    // check roles include in
    const result = roles.includes(user!.role);

    // if permisson is true and not in the result(eg. Admin is not in the list of roles)
    if (permission && !result) {
      return next(
        createError("You are not an ADMIN", 401, errorCode.unauthorised)
      );
    }

    // if permission for this user (eg. the user is Admin and permission is false)
    if (!permission && result) {
      return next(
        createError("You are not an ADMIN", 401, errorCode.unauthorised)
      );
    }

    req.user = user;
    next();
  };
};
