import { Request, Response, NextFunction } from "express";
import { body, ExpressValidator, validationResult } from "express-validator";
import {
  createOtp,
  getOtpByPhone,
  getUserByPhone,
  updateOtp,
} from "../services/authServices";
import {
  checkIsSameDateAndError,
  checkOtpRow,
  checkUserExist,
} from "../utils/auth";
import { generateOtp, generateToken } from "../utils/generate";
import * as bcrypt from "bcrypt";
import moment from "moment";

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
      const error: any = new Error(errors[0]?.msg);
      error.status = 400;
      error.code = "Error_Invalid_Hey";
      throw next(error);
    }
    let phone: string = req.body.phone;
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }
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
    // const otp =  generateOtp();
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
        const error: any = new Error("Can't Request more than 3 time per day");
        error.status = 405;
        error.code = "Error_OtpLimited";
        return next(error);
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
      const error: any = new Error("Otp Expired");
      error.status = 403;
      error.code = "Error_Expired";
      throw error;
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
      const error: any = new Error("Otp is incorrect!");
      error.status = 401;
      error.code = "Error_OtpIncorrect";
      throw error;
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
    const result = {
      phone: phone,
      password: password,
      verifiedToken: verifiedToken,
    };
    const errors = validationResult(req).array({ onlyFirstError: true });
    {
      if (errors.length > 0) {
        console.log(errors);
        const error: any = new Error(errors[0]?.msg);
        error.status = 400;
        error.code = "Error_InvalidPassword";
        throw error;
      }
    }
    res.status(200).json({
      message: "register haha hoho",
      password: result.password,
    });
  },
];
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: "register",
  });
};
