import { Request, Response, NextFunction } from "express";
import { getSettingStatus } from "../services/settings";
import { createError, errorCode } from "../utils/error";

export const maintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const whiteList = ["270.0.1.1"];
  const ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (whiteList.includes(ip)) {
    console.log(`his is the ip${ip}`);
  } else {
    const mode = await getSettingStatus("maintenance");
    if (mode?.value === "true") {
      return next(
        createError(
          "The system is under the maintenance! Please wait for the announcement!",
          503,
          errorCode.maintenance
        )
      );
    }
  }
  next();
};
