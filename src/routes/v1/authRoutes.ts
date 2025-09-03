import express from "express";
import {
  register,
  verifyOtp,
  confirmPassword,
  login,
} from "../../controllers/authControllers";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/confirm-password", confirmPassword);
authRoutes.post("/login", login);

export default authRoutes;
