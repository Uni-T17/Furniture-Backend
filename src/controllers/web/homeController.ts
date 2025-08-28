import { Request, Response, NextFunction } from "express";

export const homeController = (req: Request, res: Response, next:NextFunction) => {
    res.render("index", { "title": "Home" });
 }

