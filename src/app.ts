import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";

import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import globalErrorHandler from "./controllers/errorController.js";
import authRouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";
import userRouter from "./routes/user.route.js";
import { produceMessage } from "./services/kafka.js";
import ApiError from "./utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
console.log("Environment:", process.env.NODE_ENV);

app.set("trust proxy", 1);

// Global Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "https: data:"],
      },
    },
  })
);

if (process.env.NODE_ENV?.trim() === "development") {
  console.log("Morgan enabled...");
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 500, // 500 for development, change to 100 in production
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message:
    "You have exceeded the max requests in an hour limit! Please try again later.",
});
app.use("/api", limiter);

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN || false,
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
app.get("/", (req, res) => res.send("Server is running..."));

app.get("/ip", (req, res) => res.send(req.ip));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/chats", chatRouter);

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
