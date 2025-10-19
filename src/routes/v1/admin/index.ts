import { Router } from "express";
import { getAllUsers } from "../../../controllers/admin/userControllers";
import { maintenanceSetting } from "../../../controllers/admin/setting";
import {
  createPost,
  deletePost,
  updatePost,
} from "../../../controllers/admin/postControllers";

const adminRoutes = Router();

adminRoutes.get("/getusers", getAllUsers);
adminRoutes.post("/change-maintenance", maintenanceSetting);

//Post Routes
adminRoutes.post("/posts/createPost", createPost);
adminRoutes.put("/post/updatePost/:id", updatePost);
adminRoutes.delete("/posts/deletePost/:id", deletePost);

export default adminRoutes;
