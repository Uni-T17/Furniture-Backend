import { Request, Response, NextFunction } from "express";
import { createError, errorCode } from "../../utils/error";
import { body, param, query, validationResult } from "express-validator";
import { getUserById } from "../../services/authServices";
import { checkUserNotExist } from "../../utils/auth";
import { getPostById } from "../../services/postServices";
import { checkModelExist } from "../../utils/check";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const getPost = [
  param("id", "Invalid Post Id!").trim().notEmpty().isInt({ gt: 0 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return createError(errors[0]?.msg, 404, errorCode.invalid);
    }

    const postId = req.params.id;
    const user = await getUserById(req.userId!);

    checkUserNotExist(user);

    const post = await getPostById(+postId!);
    checkModelExist(post, "Post");

    res.status(200).json({ message: "OK", post });
  },
];

export const getPostCursorBasedQuery = [
  query("cursorId", "Invalid Cursor Id").isInt().optional(),
  query("limit", "Invalid Cursor Id").isInt().optional(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]?.msg, 400, errorCode.invalid));
    }

    const lastCursor = req.query.lastCursor;
    const limit = req.query.limit || 5;

    const userId = req.userId;

    const user = await getUserById(userId!);
    checkUserNotExist(user);

    const options = {
      take: +limit + 1,
      skip: lastCursor ? 1 : 0,
      cursor: lastCursor
        ? {
            id: Number(lastCursor),
          }
        : undefined,
      include: {
        author: true,
      },
    };

    res.status(200).json({
      message: "Success query",
    });
  },
];
