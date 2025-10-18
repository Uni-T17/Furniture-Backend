import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";
import { createError, errorCode } from "../../utils/error";
import { checkUserNotExist } from "../../utils/auth";
import { getUserById, updateUser } from "../../services/authServices";
import { checkFileNotExist } from "../../utils/check";
import path from "path";
import { unlink } from "fs/promises";
import sharp from "sharp";

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

export const uploadOptimizeProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await getUserById(req.userId!);
  checkUserNotExist(user);

  const image = req.file;
  checkFileNotExist(image);

  const fileName = Date.now() + "-" + `${Math.round(Math.random() * 1e9)}.webp`;
  try {
    const optimizedImagePath = path.join(
      __dirname,
      "../../../upload/images/",
      fileName
    );
    await sharp(req.file?.buffer)
      .resize(200, 200)
      .webp({ quality: 70 })
      .toFile(optimizedImagePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image optimize failed!" });
  }

  if (user!.image) {
    const filePath = path.join(
      __dirname,
      "../../../upload/images/",
      user!.image
    );
    try {
      await unlink(filePath);
    } catch (error) {
      console.log("File doesn't exist!");
    }
  }

  const userData = {
    image: fileName,
  };
  await updateUser(user!.id, userData);

  res.status(200).json({
    message: "Successful uploaded optimized image.",
  });
};
