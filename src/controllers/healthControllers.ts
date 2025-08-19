import { Request, Response, NextFunction } from "express";

interface customRequest extends Request {
  userId?: number;
}

export const healthControllers = (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({ message: "Well Done!", userId: req.userId });
};
