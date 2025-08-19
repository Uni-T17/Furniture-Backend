import express from "express";
import { check } from "../../middlewears/check";
import { healthControllers } from "../../controllers/healthControllers";

const healthRoutes = express.Router();

healthRoutes.get("/health", check, healthControllers);

export default healthRoutes;
