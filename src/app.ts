import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";

export const app = express();

// app.use(morgan("dev")); // Give log for every api usage from frontend

// app.use(express.urlencoded({ extended: true })); // To get direct access like req.body.password like that

// app.use(express.json()); // From string json to pure json

// app.use(cors()); // cros = Cross Origin Resourse sharing

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cors());
