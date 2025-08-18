import express, { Request, NextFunction, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";

import { limiter } from "./middlewears/rateLimit";
import { check, customRequest } from "./middlewears/check";

export const app = express();

// app.use(morgan("dev")); // Give log for every api usage from frontend

// app.use(express.urlencoded({ extended: true })); // To get direct access like req.body.password like that

// app.use(express.json()); // From string json to pure json

// app.use(cors()); // cors = Cross(Not same like fe port and be port) Origin(means port,domain) Resourse(Data) sharing

// app.use(helmet()); // to more secure like don't allow browser to guess the file name

// app.use(compression()); // to compress zip file for faster response but use more CPU(can ignore)

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cors())
  .use(helmet())
  .use(compression())
  .use(limiter);

app.get("/health", check, (req: customRequest, res: Response) => {
  // throw new Error("An Error Occur!"); // After throwing error the rest codes will not be executed
  res
    .status(200)
    .json({ message: "Okay This is my reply!", userId: req.userId });
});

// if there is an error these codes will be executed
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const errorStatus = error.status || 500;
  const errorMsg = error.message || "Server Error";
  const errorCode = error.code || "Error Code";
  res.status(errorStatus).json({ message: errorMsg, error: errorCode });
  next();
});
