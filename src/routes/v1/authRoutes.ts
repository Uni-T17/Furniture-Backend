import express from "express";
import {
  register,
  verifyOtp,
  confirmPassword,
  login,
  logout,
} from "../../controllers/authControllers";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/confirm-password", confirmPassword);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

export default authRoutes;
