import { createError, errorCode } from "./error";
import { removeFile } from "./removeFile";

export const checkFileNotExist = (file: any) => {
  if (!file) {
    const error = createError("Invalid File!!!", 404, errorCode.invalid);
    throw error;
  }
};

export const checkPostNotExist = (post: any) => {
  if (!post) {
    const error = createError("Ther is no post!!!", 404, errorCode.invalid);
    throw error;
  }
};

export const checkPostNotExistAndRemoveFile = async (
  post: any,
  fileName: string
) => {
  if (!post) {
    await removeFile(fileName!);
    const error = createError(
      "This phone number is not registered yet!",
      401,
      errorCode.unauthorised
    );
    throw error;
  }
};
