import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    res.render("404NotFound",{"title": "404 Page", "message" : "Page Not Found"})
}