import { Request, Response, NextFunction } from "express";

export const homeController = (req: Request, res: Response, next:NextFunction) => {
    res.render("index", { "title": "Home" });
}
 
export const aboutController = (req: Request, res: Response, next: NextFunction) => {
    const users = [
        { name: "Kit", age: 12 },
        { name: "Sint" , age: 14}]
    res.render("about", {
        title: "About", 
        users
    })
}

