import express from "express";
import  {homeController} from "../../controllers/web/homeController"

const homeRoute = express.Router()

homeRoute.get("/home", homeController);

export default homeRoute;