import { Router } from "express";
import { auth } from "../../middlewears/auth";
import { authorise } from "../../middlewears/authorise";
import adminRoutes from "./admin";
import userRoutes from "./api";
import authRoutes from "./authRoutes";

const routes = Router();

routes.use("/api/v1", authRoutes);
routes.use("/api/v1/user", userRoutes);
routes.use("/api/v1/admin", auth, authorise(true, "ADMIN"), adminRoutes);

export default routes;
