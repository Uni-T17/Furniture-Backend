import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { createError, errorCode } from "../../utils/error";
import { createOrUpdateSetting } from "../../services/settings";

interface CustomRequest extends Request {
  userId?: number;
}

export const maintenanceSetting = [
  body("mode", "Mode Must be boolean").isBoolean(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]?.msg, 404, errorCode.invalid));
    }

    const { mode } = req.body;
    const value = mode ? "true" : "false";
    const message = mode
      ? "Successfully set maintenance mode!"
      : "Successfully turn off maintenance mode!";

    await createOrUpdateSetting("maintenance", value);
    res.status(200).json({
      message: message,
    });
  },
];
