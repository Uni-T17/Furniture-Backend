import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/error";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies ? req.cookies.accessToken : null;

  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  if (!refreshToken) {
    return next(
      createError(
        "You are not an authenticate user!",
        401,
        "Error_Unauthenticated"
      )
    );
  }
  if (!accessToken) {
    return next(
      createError("Access Token is expired", 401, "Error_AccessTokenExpired")
    );
  }

  next();
};
