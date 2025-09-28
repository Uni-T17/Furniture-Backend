import { Router } from "express";
import { getAllUsers } from "../../../controllers/admin/userControllers";
import { maintainenceSetting } from "../../../controllers/admin/setting";

const adminRoutes = Router();

adminRoutes.get("/getusers", getAllUsers);
adminRoutes.post("/change-maintainence", maintainenceSetting);

export default adminRoutes;
