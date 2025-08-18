import express from "express";
import { check } from "../../middlewears/check";
import { healthController } from "../../controllers/healthController";

const healthRoute = express.Router();

healthRoute.get("/health", check, healthController);

export default healthRoute;
