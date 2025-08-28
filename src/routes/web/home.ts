import express from "express";
import  {homeController, aboutController} from "../../controllers/web/homeController"

const homeRoute = express.Router()

homeRoute.get("/home", homeController);

homeRoute.get("/about",aboutController)

export default homeRoute;