import express from "express";
import { changeLanguage } from "../../../controllers/api/profileControllers";

const userRoutes = express.Router();

userRoutes.post("/change-lang", changeLanguage);

export default userRoutes;
