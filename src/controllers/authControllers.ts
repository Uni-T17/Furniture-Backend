import { Request, Response, NextFunction } from "express";
import { body, ExpressValidator, validationResult } from "express-validator";
import {
  createOtp,
  createUser,
  getOtpByPhone,
  getUserById,
  getUserByPhone,
  updateOtp,
  updateUser,
} from "../services/authServices";
import {
  checkIsSameDateAndError,
  checkOtpRow,
  checkUserExist,
  checkUserNotExist,
} from "../utils/auth";
import { generateOtp, generateToken } from "../utils/generate";
import * as bcrypt from "bcrypt";
import moment from "moment";
import { token } from "morgan";
import { createError, errorCode } from "../utils/error";
import jwt from "jsonwebtoken";
import { removeZeroNine } from "../utils/helper";
import { sendOtp } from "../utils/getOtp";

export const register = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone Number Must Be 5-12 numbers"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      throw next(createError(errors[0]?.msg, 400, errorCode.invalid));
    }
    let phone: string = req.body.phone;
    phone = removeZeroNine(phone);
    const user = await getUserByPhone(phone);
    checkUserExist(user);

    // OTP sending Logic
    // Generate Otp and Call Otp Send API
    // Hash Otp
    // If Can't send throw error
    // make Expired time
    // Save Otp to Database
    //Check Otp Avaiablity
    const otp = 123456; /// Production Only
    // const otp = generateOtp();
    // await sendOtp(`${phone.toString()}@lamduan.mfu.ac.th`, otp);
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString(), salt);

    const token = generateToken();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    let result;

    const otpRow = await getOtpByPhone(phone);
    if (!otpRow) {
      result = await createOtp({
        phone,
        otp: hashOtp,
        rememberToken: token,
        count: 1,
        expiresAt: expiresAt,
      });
    } else {
      let count;
      const lastUpdated = new Date(otpRow.updatedAt).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      const isSameDate = today === lastUpdated;
      checkIsSameDateAndError(isSameDate, otpRow.error);
      if (isSameDate) {
        count = otpRow.count + 1;
      } else {
        count = 1;
      }
      if (count > 3) {
        return next(
          createError(
            "Can't Request more than 3 time per day",
            405,
            errorCode.overLimit
          )
        );
      }
      result = await updateOtp(otpRow.id, {
        otp: hashOtp,
        rememberToken: token,
        count: count,
        expiresAt: expiresAt,
      });
    }

    res.status(200).json({
      message: `Otp is sent to 09${phone}`,
      phone: result.phone,
      otp: result.otp,
      rememberToken: result.rememberToken,
      expiresAt: `Expired in ${expiresAt} min`,
      createdAt: result.createdAt,
    });
  },
];

export const verifyOtp = [
  body("phone", "Inavlis Phone Number.")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("rememberToken").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      const error: any = new Error(errors[0]?.msg);
      error.status = 409;
      error.code = "Error_InvalidOTP";
      throw error;
    }

    const { phone, otp, rememberToken } = req.body;

    const user = await getUserByPhone(phone);
    checkUserExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    const lastVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastVerify === today;
    checkIsSameDateAndError(isSameDate, otpRow!.error);

    if (otpRow!.rememberToken !== rememberToken) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      const error: any = new Error("Invalid Token");
      error.status = 400;
      error.code = "Error_InvalidToken";
      throw error;
    }

    const isExpired = moment().diff(otpRow!.updatedAt, "minute") > 2;
    if (isExpired) {
      return next(createError("Otp Expired", 403, errorCode.otpExpired));
    }
    let otpData;

    // Check match Otp
    const isMatchOtp = await bcrypt.compare(otp, otpRow!.otp);
    if (!isMatchOtp) {
      if (!isSameDate) {
        otpData = {
          error: 1,
        };
      } else {
        otpData = {
          error: {
            increment: 1,
          },
        };
      }
      await updateOtp(otpRow!.id, otpData);
      return next(createError("Otp is incorrect!", 401, errorCode.invalid));
    }

    // generate verifyToken
    const verifiedToken = generateToken();
    otpData = {
      verifiedToken: verifiedToken,
      error: 0,
      count: 1,
    };

    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "Otp is successfully verified.",
      phone: result.phone,
      verifiedToken: result.verifiedToken,
    });
  },
];

export const confirmPassword = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("password", "Invalid Password")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 15 }),
  body("verifiedToken", "Invalid Token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone, password, verifiedToken } = req.body;

    const errors = validationResult(req).array({ onlyFirstError: true });
    {
      if (errors.length > 0) {
        return next(createError(errors[0]?.msg, 400, "Error_InvalidPassword"));
      }
    }

    // Check User Already Exist
    const user = await getUserByPhone(phone);
    checkUserExist(user);

    // Check OtpRow
    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    // Check VerifiedToken
    if (otpRow!.error === 5) {
      return next(
        createError("This request might be an attack!", 404, "Error_BadRequest")
      );
    }

    if (otpRow!.verifiedToken !== verifiedToken) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      return next(
        createError("This request might be an attack!", 404, "Error_BadRequest")
      );
    }

    const isExpired = moment().diff(otpRow!.updatedAt, "minute") > 15;
    if (isExpired) {
      return next(
        createError(
          "Your request is expired. Please try again.",
          403,
          "Error_Expired"
        )
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const randToken = "Will Replace This Later";

    const userData = {
      phone,
      password: hashPassword,
      randToken,
    };

    const newUser = await createUser(userData);
    const accessTokenPayload = { id: newUser.id };
    const refreshTokenPayload = { id: newUser.id, phone: newUser.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 15 * 60, // 15 min
      }
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d", // 30 days
      }
    );

    // update Refresh Token
    const newUserData = {
      randToken: refreshToken,
    };

    await updateUser(newUser.id, newUserData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .status(201)
      .json({
        message: "Successfully register a new user.",
        userId: newUser.id,
      });
  },
];
export const login = [
  body("phone", "Invalid Phone Number.")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 8, max: 12 }),
  body("password", "Password Must be 8 digits.")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 15 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]?.msg, 409, "Error_InvalidInput"));
    }

    let phone: string = req.body.phone;
    let password = req.body.password;

    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }

    const user = await getUserByPhone(phone);

    // Check User Exist Or Not
    checkUserNotExist(user);

    // check freeze user?
    if (user!.status === "FREEZE") {
      return next(createError("This User is Freezed!", 401, "Error_Freezed"));
    }

    // check match password
    const isMatchPassword = await bcrypt.compare(password, user!.password);

    // Check Password Mistake times
    if (!isMatchPassword) {
      let userData;
      // In Same Day
      const lastUpdated = new Date(user!.updatedAt).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      if (lastUpdated === today) {
        // Freeze if more than 2 time
        if (user!.errorLoginCount >= 2) {
          userData = {
            status: "FREEZE",
          };
        } else {
          userData = {
            errorLoginCount: { increment: 1 },
          };
        }
      } else {
        // Not Same Day
        userData = {
          errorLoginCount: 1,
        };
      }
      updateUser(user!.id, userData);
      return next(
        createError(req.t("Wrong Password!"), 401, "Error_WrongPassword")
      );
    }

    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, phone: user!.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 15 * 60, // 15 min
      }
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!
    );

    const userData = {
      errorLoginCount: 0,
      randToken: refreshToken,
    };
    await updateUser(user!.id, userData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Successfully Login",
        userId: user!.id,
      });
  },
];

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  // Check Refresh Token Exist Or Not
  if (!refreshToken) {
    return next(
      createError(
        "Your are not an unauthenticated User",
        401,
        "Error_Unauthenticated"
      )
    );
  }
  // Decode the token and check matching
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      id: number;
      phone: string;
    };
  } catch (error) {
    return next(
      createError(
        "Your are not an unauthenticated User",
        401,
        "Error_Unauthenticated"
      )
    );
  }

  if (isNaN(decoded!.id)) {
    return next(
      createError(
        "Your are not an unauthenticated User",
        401,
        "Error_Unauthenticated"
      )
    );
  }
  // Get user by id and check not exist
  const user = await getUserById(decoded!.id);
  checkUserNotExist(user);

  // update the user randToken
  const userData = {
    randToken: generateToken(),
  };

  await updateUser(user!.id, userData);

  // Remove tokens
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  // Give Back Successful Response
  res.status(200).json({ message: "Successfully log out. See You Soon!" });
};

export const forgetPassword = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("[0-9]+$")
    .isLength({ min: 8, max: 15 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]!.msg, 400, errorCode.invalid));
    }

    // const refreshToken = req.cookies ? req.cookies.refreshToken : null;
    // const accessToken = req.cookies ? req.cookies.accessToken : null;

    // if (refreshToken | accessToken) {
    //   return next(
    //     createError(
    //       "Your are not an unauthenticated User",
    //       401,
    //       "Error_Unauthenticated"
    //     )
    //   );
    // }

    let phone = req.body.phone;
    // remove 09 if start with 09
    phone = removeZeroNine(phone);

    const user = await getUserByPhone(phone);
    checkUserNotExist(user);

    // get otpRow by phone
    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    // Generate Otp
    const otp = 123456;
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString(), salt);

    const token = generateToken();
    const lastUpdated = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastUpdated === today;

    checkIsSameDateAndError(isSameDate, otpRow!.error);

    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);
    let count;
    if (isSameDate) {
      count = otpRow!.count + 1;
    } else {
      count = 0;
    }
    if (count > 3) {
      return next(
        createError(
          "Can't Request more than 3 time per day",
          405,
          errorCode.overLimit
        )
      );
    }
    const otpData = {
      otp: hashOtp,
      rememberToken: token,
      count: count,
    };

    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "Successfully send otp to reset password",
      phone: result.phone,
      token: result.rememberToken,
      expiredAt: `Otp will be expired at ${expiredAt}`,
    });
  },
];

export const verifyOtpForgetPassword = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("[0-9]+$")
    .isLength({ min: 6, max: 15 }),
  body("otp").trim().notEmpty().isLength({ min: 6, max: 6 }),
  body("rememberToken").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]!.msg, 400, errorCode.invalid));
    }

    const { phone, otp, rememberToken } = req.body;

    const user = await getUserByPhone(phone);
    checkUserNotExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    const lastVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastVerify === today;
    checkIsSameDateAndError(isSameDate, otpRow!.error);

    let otpData;
    // check remember token is same or an attack
    if (otpRow?.rememberToken !== rememberToken) {
      otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      return next(createError("This is an attack", 401, errorCode.attack));
    }

    // if more than 2 min make otp expired
    const isExpired = moment().diff(otpRow!.updatedAt, "minute") > 2;
    if (isExpired) {
      return next(createError("Otp Expired", 403, errorCode.otpExpired));
    }
    // C
    // heck match the otp
    const isMatchOtp = await bcrypt.compare(otp, otpRow!.otp);
    if (!isMatchOtp) {
      // if the otp request is same date
      if (isSameDate) {
        otpData = {
          error: { increment: 1 },
        };
      } else {
        otpData = {
          error: 1,
        };
      }
      await updateOtp(otpRow!.id, otpData);
      return next(createError("Otp is incorrect!", 401, errorCode.invalid));
    }

    // generate verify token
    const verifiedToken = generateToken();
    otpData = {
      verifiedToken,
      error: 0,
      count: 1,
    };

    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "Successful Verify Otp",
      phone: result.phone,
      verifiedToken: result.verifiedToken,
    });
  },
];

export const resetPassword = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("password", "Invalid Password")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 15 }),
  body("verifiedToken", "Invalid Token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0]!.msg, 400, errorCode.invalid));
    }

    const { phone, password, verifiedToken } = req.body;

    const user = await getUserByPhone(phone);
    checkUserNotExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    if (otpRow!.error >= 5) {
      return next(
        createError("This request might be an attack!", 404, errorCode.attack)
      );
    }

    if (otpRow!.verifiedToken !== verifiedToken) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      return next(
        createError("This request might be an attack!", 404, errorCode.attack)
      );
    }

    const isExpired = moment().diff(otpRow!.updatedAt, "minute") > 15;

    if (isExpired) {
      return next(
        createError("Your request is expired!", 404, errorCode.requestExpired)
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, phone: user!.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: 15 * 60 }
    );
    const refreshToken = jwt.sign(
      accessTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" }
    );

    const userData = {
      password: hashPassword,
      randToken: refreshToken,
    };
    await updateUser(user!.id, userData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, //
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Successfully change password!",
        userId: user!.id,
      });
  },
];
