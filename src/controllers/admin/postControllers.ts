import { Request, Response, NextFunction } from "express";
import { createError, errorCode } from "../../utils/error";
import { body, param, validationResult } from "express-validator";
import {
  checkUserNotExist,
  checkUserNotExistAndRemoveFile,
} from "../../utils/auth";
import { getUserById } from "../../services/authServices";
import {
  checkFileNotExist,
  checkPostNotExist,
  checkPostNotExistAndRemoveFile,
} from "../../utils/check";
import {
  createNewPost,
  deletePostById,
  getPostById,
  updatePostById,
} from "../../services/postServices";
import { PostType } from "../types/postType";
import sanitizeHtml from "sanitize-html";
import { removeFile } from "../../utils/removeFile";

interface CustomRequest extends Request {
  userId?: number;
}

export const createPost = [
  body("category", "Invalid Category!").trim().notEmpty().escape(),
  body("type", "Invalid type!").trim().notEmpty().escape(),
  body("title", "Invalid Title!").trim().notEmpty().escape(),
  body("content", "Invalid Content!").trim().notEmpty().escape(),
  body("body", "Invalid Body!")
    .trim()
    .notEmpty()
    .customSanitizer((value) => sanitizeHtml(value))
    .notEmpty(),
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
    try {
      const errors = validationResult(req).array({ onlyFirstError: true });
      if (errors.length > 0) {
        await removeFile(req.file?.filename!);
        return next(createError(errors[0]?.msg, 404, errorCode.invalid));
      }

      const user = await getUserById(req.userId!);
      const image = req.file;
      checkFileNotExist(image);
      await checkUserNotExistAndRemoveFile(user, image!.filename!);
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
    } catch (error) {
      await removeFile(req.file?.filename!);
    }
  },
];

export const updatePost = [
  body("postId", "Invalid PostId").trim().notEmpty().isInt({ min: 1 }),
  body("category", "Invalid Category!").trim().notEmpty().escape(),
  body("type", "Invalid type!").trim().notEmpty().escape(),
  body("title", "Invalid Title!").trim().notEmpty().escape(),
  body("content", "Invalid Content!").trim().notEmpty().escape(),
  body("body", "Invalid Body!")
    .trim()
    .notEmpty()
    .customSanitizer((value) => sanitizeHtml(value))
    .notEmpty(),
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
    try {
      const errors = validationResult(req).array({ onlyFirstError: true });
      if (errors.length > 0) {
        if (req.file) {
          await removeFile(req.file?.filename!);
        }
        return next(createError(errors[0]?.msg, 404, errorCode.invalid));
      }

      const user = await getUserById(req.userId!);
      const image = req.file;
      if (image) {
        await checkUserNotExistAndRemoveFile(user, image!.filename);
      } else {
        checkUserNotExist(user);
      }
      const { postId, category, type, title, content, body, tags } = req.body;

      const post = await getPostById(Number(postId));
      if (image) {
        checkPostNotExistAndRemoveFile(post, image!.filename);
      } else {
        checkPostNotExist(post);
      }

      if (user!.id !== post!.authorId) {
        if (image) {
          await removeFile(image!.filename);
        }
        return next(
          createError("You are not the author!", 400, errorCode!.invalid)
        );
      }

      let postData: any = {
        category: category,
        type: type,
        title: title,
        content: content,
        body: body,
        image: image,
        tags: tags,
      };
      if (image) {
        await removeFile(post!.image);
        postData.image = image.filename;
      }

      const updatedPost = await updatePostById(post!.id, postData);
      const updatedPostId = updatedPost.id;

      res.status(200).json({
        message: "Successfully Update Post",
        postId: updatedPostId,
      });
    } catch (error) {
      if (req.file) {
        await removeFile(req.file?.filename!);
      }
      return error;
    }
  },
];
export const deletePost = [
  body("postId", "Invalid PostId")
    .trim()
    .notEmpty()
    .isInt({ min: 1, max: 20000 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]?.msg, 404, errorCode.invalid));
    }
    const user = await getUserById(req.userId!);
    checkUserNotExist(user);
    const { postId } = req.body;
    const post = await getPostById(Number(postId));
    checkPostNotExist(post);

    if (user!.id !== post!.authorId) {
      return next(
        createError("You are not the author!", 400, errorCode!.invalid)
      );
    }

    const image = post!.image;
    const deletedPost = await deletePostById(post!.id);
    await removeFile(image);
    const deletedPostId = deletedPost.id;

    res
      .status(200)
      .json({ message: "Successfully delete post.", deletedPostId });
  },
];
