import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./routes";
import { corsOptions } from "./config/cors.config";
import { requestLogger } from "@/middleware/request-logger.middleware";
import { errorHandler } from "@/middleware/error-handler.middleware";
import helmet from "helmet";

const app = express();

// ---------------------------
// Security
//----------------------------
app.disable("x-powered-by");
app.use(helmet());

// ---------------------------
// Middlewares
// ---------------------------
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------
// Routes
// ---------------------------
app.use("/api", routes);

// ---------------------------
// Global Error Handler
// Must be registered after routes
// ---------------------------
// app.use(errorHandler); //enable when production

export default app;