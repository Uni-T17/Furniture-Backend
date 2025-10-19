import { Request, Response, NextFunction } from "express";
import { createError, errorCode } from "../../utils/error";
import { body, validationResult } from "express-validator";
import { checkUserNotExist } from "../../utils/auth";
import { getUserById } from "../../services/authServices";
import { checkFileNotExist } from "../../utils/check";
import { createNewPost } from "../../services/postServices";
import { PostType } from "../types/postType";

interface CustomRequest extends Request {
  userId?: number;
}

// categoryId Int
// category   Category @relation(fields: [categoryId], references: [id])
// typeId     Int
// type       Type     @relation(fields: [typeId], references: [id])
// title      String   @db.VarChar(225)
// content    String
// body       String
// image      String   @db.VarChar(255)
// createdAt  DateTime @default(now())
// updatedAt  DateTime @updatedAt
// tags PostTag[]

export const createPost = [
  body("category", "Invalid Category!").trim().notEmpty().escape(),
  body("type", "Invalid type!").trim().notEmpty().escape(),
  body("title", "Invalid Title!").trim().notEmpty().escape(),
  body("content", "Invalid Content!").trim().notEmpty().escape(),
  body("body", "Invalid Body!").trim().notEmpty().escape(),
  body("tags", "Invalid Content!")
    .optional({ nullable: true })
    .customSanitizer((value) => {
      if (value) {
        return value.split(",").filter((tag: string) => tag.trim() !== "");
      } else {
        return value;
      }
    }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return createError(errors[0]?.msg, 404, errorCode.invalid);
    }

    const user = await getUserById(req.userId!);
    const image = req.file;
    checkUserNotExist(user);
    checkFileNotExist(image);
    const { category, type, title, content, body, tags } = req.body;

    const postData: PostType = {
      authorId: user!.id,
      category: category,
      type: type,
      title: title,
      content: content,
      body: body,
      image: image!.filename,
      tags: tags,
    };

    const post = await createNewPost(postData);

    res
      .status(200)
      .json({ message: "Successfully Create A New Post", postId: post.id });
  },
];

export const updatePost = [
  body("", ""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return createError(errors[0]?.msg, 404, errorCode.invalid);
    }

    res.status(200).json({ message: "OK" });
  },
];

export const deletePost = [
  body("", ""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return createError(errors[0]?.msg, 404, errorCode.invalid);
    }

    res.status(200).json({ message: "OK" });
  },
];
