import express from "express";
import { changeLanguage } from "../../../controllers/api/profileControllers";
import { testPermission } from "../../../controllers/admin/userControllers";
import { auth } from "../../../middlewears/auth";

const userRoutes = express.Router();

userRoutes.post("/change-lang", changeLanguage);
userRoutes.get("/test-permission", auth, testPermission);

export default userRoutes;
