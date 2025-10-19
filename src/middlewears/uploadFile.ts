import multer, { FileFilterCallback, memoryStorage } from "multer";
import { Request } from "express";
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/images");
    // check file and image
    // const type = file.mimetype.split("/")[0];
    // if (type === "image") {
    //     cb(null, "upload/images")
    // } else {
    //     cb(null, "upload/files")
    // }
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const uniqueSurfix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSurfix + "." + ext);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // max is 10 mb
});

export const uploadOptimize = multer({
  storage: memoryStorage(),
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
});

export default upload;
