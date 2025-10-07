import { generateOtp } from "./generate";

const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_PW,
  },
});

export const sendOtp = async (to: string, otp: number) => {
  await transporter.sendMail({
    from: `"Book Ex" <${process.env.OTP_EMAIL}>`,
    to: to,
    subject: "Your OTP from BookEx",
    html: `<p>Your OTP is: <b>${otp}</b></p>`,
  });
  console.log("send Email");
};
