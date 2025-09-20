export const createError = (msg: string, status: number, code: string) => {
  const error: any = new Error(msg);
  error.status = status;
  error.code = code;
  return error;
};

export const errorCode = {
  invalid: "Error_Invalid",
  unauthenticated: "Error_Unauthenticated",
  attack: "Error_Attack",
  accessTokenExpired: "Error_AccessTokenExpired",
  userExist: "Error_UserAlreadyExist",
  overLimit: "Error_OverLimit",
  otpExpired: "Error_OtpExpired",
  requestExpired: "Error_RequestExpired",
  accountFreeze: "Error_AccountFreeze",
  unauthorised: "Error_Unauthorised",
  maintenance: "Error_Maintenance",
};
