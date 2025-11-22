import express from "express";
import {
  changeLanguage,
  uploadOptimizeProfile,
  uploadProfile,
} from "../../../controllers/api/profileControllers";
import { testPermission } from "../../../controllers/admin/userControllers";
import { auth } from "../../../middlewears/auth";
import upload, { uploadOptimize } from "../../../middlewears/uploadFile";
import {
  getPost,
  getPostCursorBasedQuery,
} from "../../../controllers/api/postControllers";

const userRoutes = express.Router();

userRoutes.post("/change-lang", changeLanguage);
userRoutes.get("/test-permission", auth, testPermission);
userRoutes.put("/profile/upload", auth, upload.single("avatar"), uploadProfile);
userRoutes.put(
  "/profile/uploadOptimize",
  auth,
  upload.single("avatar"),
  uploadOptimizeProfile
);

userRoutes.get("/posts/get-posts/:id", auth, getPost);
userRoutes.get("/posts/get-posts", getPostCursorBasedQuery);

export default userRoutes;
