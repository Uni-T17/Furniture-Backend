import express, { Request, NextFunction, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";

import { limiter } from "./middlewears/rateLimit";
import { check, customRequest } from "./middlewears/check";

import authRoutes from "./routes/v1/authRoutes";
import adminRoutes from "./routes/v1/admin/adminRoutes";
import CookieParser from "cookie-parser";
import cookieParser from "cookie-parser";
import { auth } from "./middlewears/auth";

import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleWare from "i18next-http-middleware";
import path from "path";

export const app = express();

// app.use(morgan("dev")); // Give log for every api usage from frontend

// app.use(express.urlencoded({ extended: true })); // To get direct access like req.body.password like that

// app.use(express.json()); // From string json to pure json

// app.use(cors()); // cors = Cross(Not same like fe port and be port) Origin(means port,domain) Resourse(Data) sharing

// app.use(helmet()); // to more secure like don't allow browser to guess the file name

// app.use(compression()); // to compress zip file for faster response but use more CPU(can ignore)

// Add  CORS
var whitelist = ["http://example1.com", "http://localhost:5173"];
var corsOptions = {
  origin: function (
    origin: any,
    callback: (err: Error | null, origin?: any) => void
  ) {
    // this is for mobile and
    if (!origin) {
      return callback(null, true);
    }
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cookieParser())
  .use(cors(corsOptions))
  .use(helmet())
  .use(compression())
  .use(limiter);

// app.use(express.static("public"));

i18next
  .use(Backend)
  .use(middleWare.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(
        process.cwd(),
        "src/locals",
        "{{lng}}",
        "{{ns}}.json"
      ),
    },
    detection: {
      order: ["querystring", "cookie"],
      caches: ["cookie"],
    },
    fallbackLng: "en",
    preload: ["en", "mm"],
  });

app.use(middleWare.handle(i18next));

app.use("/api/v1", authRoutes);
app.use("/api/v1", auth, adminRoutes);

// app.use(errorController.notFound);

// if there is an error these codes will be executed
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const errorStatus = error.status || 500;
  const errorMsg = error.message || "Server Error";
  const errorCode = error.code || "Error Code";
  res.status(errorStatus).json({ message: errorMsg, error: errorCode });
  next();
});
