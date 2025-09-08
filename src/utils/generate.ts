import { randomBytes } from "crypto";

export const generateOtp = () => {
  return (
    (parseInt(randomBytes(3).toString("hex").toUpperCase(), 16) % 900000) +
    100000
  );
};

export const generateToken = () => {
  return randomBytes(32).toString("hex");
};
