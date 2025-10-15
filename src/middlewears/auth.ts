import { Request, Response, NextFunction } from "express";
import { createError, errorCode } from "../utils/error";
import jwt from "jsonwebtoken";
import { checkUserNotExist } from "../utils/auth";
import { getUserById, updateUser } from "../services/authServices";

interface CustomRequest extends Request {
  userId?: number;
}

export const auth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // For Mobile
  // const platform = req.headers["x-platform"];
  // if (platform === "mobile") {
  //   const accessTokenMobile = req.headers.authorization?.split(" ")[1];
  //   console.log(`This is for moblie ${accessTokenMobile}`);
  // } else {
  //   console.log("This is not mobile");
  // }
  const accessToken = req.cookies ? req.cookies.accessToken : null;

  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  const generateNewToken = async () => {
    // Decode the refreshToken and check correct or not

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        id: number;
        phone: string;
      };
    } catch (error) {
      return next(
        createError(
          "You are not an authenticated user!!",
          401,
          errorCode.unauthenticated
        )
      );
    }

    // If id is not a number
    if (isNaN(decoded.id)) {
      return next(
        createError(
          "You are not an authenticated user!",
          401,
          errorCode.unauthenticated
        )
      );
    }

    // Get user
    const user = await getUserById(decoded!.id);

    // if user is not exist
    checkUserNotExist(user);

    // check same phone or not
    if (decoded!.phone !== user!.phone) {
      return next(
        createError(
          "You are not an authenticated user!",
          401,
          errorCode.unauthenticated
        )
      );
    }

    // Check randToken same or not
    if (user!.randToken !== refreshToken) {
      return next(
        createError(
          "You are not an authenticated user!",
          401,
          errorCode.unauthenticated
        )
      );
    }

    const accessPayLoad = { id: user!.id };
    const refreshPayLoad = { id: user!.id, phone: user!.phone };

    // Generate Access And Refresh Token
    const newAccessToken = jwt.sign(
      accessPayLoad,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 15 * 60,
      }
    );
    const newRefreshToken = jwt.sign(
      refreshPayLoad,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      }
    );

    // Update Refresh Token
    const userData = {
      randToken: newRefreshToken,
    };

    await updateUser(user!.id, userData);

    // Put Tokens In res Cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days really
    });

    // Give Back This user Id
    req.userId = user!.id;
    return next();
  };

  if (!refreshToken) {
    return next(
      createError(
        "You are not an authenticate user!",
        401,
        errorCode.unauthenticated
      )
    );
  }
  if (!accessToken) {
    await generateNewToken();
  }

  // Verify Access Token
  let decoded;
  try {
    // Need to declare type for the decoded object

    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
      id: number;
    };

    if (isNaN(decoded!.id)) {
      return next(
        createError(
          "You are not an authenticated user!",
          401,
          errorCode.unauthenticated
        )
      );
    }
    req.userId = decoded!.id;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      await generateNewToken();
    } else {
      return next(
        createError("Access Token is Invalid", 401, errorCode.attack)
      );
    }
  }
};
