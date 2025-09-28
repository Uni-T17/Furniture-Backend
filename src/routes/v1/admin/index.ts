import { Router } from "express";
import { getAllUsers } from "../../../controllers/admin/userControllers";
import { maintenanceSetting } from "../../../controllers/admin/setting";

const adminRoutes = Router();

adminRoutes.get("/getusers", getAllUsers);
adminRoutes.post("/change-maintenance", maintenanceSetting);

export default adminRoutes;
