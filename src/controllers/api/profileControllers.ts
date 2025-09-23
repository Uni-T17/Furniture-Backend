import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";
import { createError, errorCode } from "../../utils/error";

interface CustomRequest extends Request {
  userId?: number;
}

export const changeLanguage = [
  query("lng", "Invalid Language")
    .trim()
    .notEmpty()
    .matches("[a-z]+$")
    .isLength({ min: 2, max: 3 })
    .withMessage("Must 2 or 3 words"),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]?.msg, 404, errorCode.invalid));
    }

    const { lng } = req.query;

    res
      .cookie("i18next", lng)
      .status(200)
      .json({ message: req.t("SuccessLang", { language: lng }) });
  },
];
