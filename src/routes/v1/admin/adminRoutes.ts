import { Router } from "express";
import { getAllUsers } from "../../../controllers/admin/userControllers";
import { auth } from "../../../middlewears/auth";

const adminRoutes = Router();

adminRoutes.get("/admin", getAllUsers);

export default adminRoutes;
