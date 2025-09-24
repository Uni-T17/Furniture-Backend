import express from "express";
import {
  register,
  verifyOtp,
  confirmPassword,
  login,
  logout,
  forgetPassword,
  verifyOtpForgetPassword,
  resetPassword,
} from "../../controllers/authControllers";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/confirm-password", confirmPassword);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

// Forget Password
authRoutes.post("/forget-password", forgetPassword);
authRoutes.post("/verify-otp-forget-password", verifyOtpForgetPassword);
authRoutes.post("/reset-password", resetPassword);

export default authRoutes;
