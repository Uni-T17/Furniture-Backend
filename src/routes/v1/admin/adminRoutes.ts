import { Router } from "express";
import { getAllUsers } from "../../../controllers/admin/userControllers";

const adminRoutes = Router();

adminRoutes.get("/admin", getAllUsers);

export default adminRoutes;
