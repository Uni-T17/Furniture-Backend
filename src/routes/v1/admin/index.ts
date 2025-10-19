import { Router } from "express";
import { getAllUsers } from "../../../controllers/admin/userControllers";
import { maintenanceSetting } from "../../../controllers/admin/setting";
import {
  createPost,
  deletePost,
  updatePost,
} from "../../../controllers/admin/postControllers";
import upload from "../../../middlewears/uploadFile";

const adminRoutes = Router();

adminRoutes.get("/getusers", getAllUsers);
adminRoutes.post("/change-maintenance", maintenanceSetting);

//Post Routes
adminRoutes.post("/posts/create-post", upload.single("image"), createPost);
adminRoutes.put("/post/update-post", upload.single("image"), updatePost);
adminRoutes.delete("/posts/delete-post", deletePost);

export default adminRoutes;
