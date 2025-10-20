import { unlink } from "fs/promises";
import path from "path";

export const removeFile = async (fileName: string) => {
  try {
    const filePath = path.join(
      __dirname,
      "../../",
      "/upload/images/",
      fileName
    );

    await unlink(filePath);
  } catch (error) {
    console.log("File doesn't exist!!");
  }
};
