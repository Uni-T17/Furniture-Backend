import { randomBytes } from "crypto";

export const generateOtp = () => {
  return parseInt(randomBytes(3).toString("hex").toUpperCase());
};

export const generateToken = () => {
  return randomBytes(32).toString("hex");
};
