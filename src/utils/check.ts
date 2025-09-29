import { createError, errorCode } from "./error";

export const checkFileNotExist = (file: any) => {
  if (!file) {
    const error = createError("Invalid File!", 404, errorCode.invalid);
    throw error;
  }
};
