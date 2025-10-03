import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";
import { createError, errorCode } from "../../utils/error";
import { checkUserNotExist } from "../../utils/auth";
import { getUserById, updateUser } from "../../services/authServices";
import { checkFileNotExist } from "../../utils/check";
import path from "path";
import { unlink } from "fs/promises";

interface CustomRequest extends Request {
  userId?: number;
  file?: any;
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

export const uploadProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await getUserById(req.userId!);
  checkUserNotExist(user);
  const image = req.file;
  checkFileNotExist(image);
  console.log(image.filename);

  if (user!.image!) {
    const filePath = path.join(
      __dirname,
      "../../../upload/images/",
      user!.image
    );
    try {
      await unlink(filePath);
    } catch (error) {
      console.log("File doesn't exist!!");
    }
  }

  const userData = {
    image: image.filename,
  };

  await updateUser(user!.id, userData);

  res
    .status(200)
    .json({ message: "Successfully upload profile!", image: image.filename });
};
