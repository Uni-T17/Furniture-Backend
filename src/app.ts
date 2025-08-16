import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";

export const app = express();

app.use(morgan("dev")); // Give log for every api usage from frontend
