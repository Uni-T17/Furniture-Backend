import { Request, Response, NextFunction } from "express";

export interface customRequest extends Request {
  userId?: number;
}

export const check = (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  //   // Error handling in middlewear
  //   const err: any = new Error("Big Error");
  //   err.status = 401;
  //   err.code = "Token expired!";
  //   return next(err); // Don't forget to return not to execute the rest codes
  req.userId = 12345;
  next();
};
