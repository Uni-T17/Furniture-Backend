import { Router } from "express";
import { getAllUsers } from "../../../controllers/admin/userControllers";
import { auth } from "../../../middlewears/auth";

const adminRoutes = Router();

adminRoutes.get("/getusers", getAllUsers);

export default adminRoutes;
