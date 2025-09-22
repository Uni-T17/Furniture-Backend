import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/error";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
  userId?: number;
}

export const auth = (req: CustomRequest, res: Response, next: NextFunction) => {
  // For Mobile
  // const platform = req.headers["x-platform"];
  // if (platform === "mobile") {
  //   const accessTokenMobile = req.headers.authorization?.split(" ")[1];
  //   console.log(`This is for moblie ${accessTokenMobile}`);
  // } else {
  //   console.log("This is not mobile");
  // }
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

  // Verify Access Token
  let decoded;
  try {
    // Need to declare type for the decoded object
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
      id: number;
    };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(
        createError("Access token is expired", 401, "Error_AccessTokenExpired")
      );
    } else {
      return next(createError("Access Token is Invalid", 400, "Error_Attack"));
    }
  }
  req.userId = decoded!.id;

  next();
};
