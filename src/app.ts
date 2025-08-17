import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";

import { limiter } from "./middlewears/rateLimit";

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

app.get("/", (req, res) => {
  res.status(200).json({ message: "Okay This is my reply!" });
});
