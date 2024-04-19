import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";

import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import globalErrorHandler from "./controllers/errorController.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import ApiError from "./utils/ApiError.js";

const __dirname = path.resolve();
const app = express();
console.log("Environment:", process.env.NODE_ENV);

// Global Middlewares
app.use(helmet());

if (process.env.NODE_ENV?.trim() === "development") {
  console.log("Morgan enabled...");
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message:
    "You have exceeded the max requests in an hour limit! Please try again later.",
});
app.use("/api", limiter);

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "16kb" }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);

// Not found route
app.all("*", (req, res, next) => {
  next(
    new ApiError(
      `Can't perform (${req.method}) request on ${req.originalUrl}`,
      400
    )
  );
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;
