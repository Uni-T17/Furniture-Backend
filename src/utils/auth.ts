import { createError } from "./error";

export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error("User Already Exist");
    error.status = 409;
    error.code = "Error_AlreadyExist";
    throw error;
  }
};

export const checkIsSameDateAndError = (
  isSameDate: boolean,
  errorCount: number
) => {
  if (isSameDate && errorCount === 5) {
    const error: any = new Error("You can't access for today for 5 errors!");
    error.status = 405;
    error.code = "Error_SameDateErrorLimit";
    throw error;
  }
};

export const checkOtpRow = (otpRow: any) => {
  if (!otpRow) {
    const error: any = new Error("Otp Not Found!");
    error.status = 409;
    error.code = "Error_OtpNotFound";
    throw error;
  }
};

export const checkUserNotExist = (user: any) => {
  if (!user) {
    const error = createError(
      "This phone number is not registered yet!",
      401,
      "Error_Unauthorized"
    );
    throw error;
  }
};
