import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { logger } from "./lib/logger.js";
import authRouter from "./routes/auth.js";
import tasksRouter from "./routes/tasks.js";
import dashboardRouter from "./routes/dashboard.js";
import habitsRouter from "./routes/habits.js";
import aiRouter from "./routes/ai.js";

const app = express();

app.set("trust proxy", 1);



app.use(pinoHttp({ logger, autoLogging: false }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


// Routes
app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/ai", aiRouter);

// System Status Check
app.get("/api/status", (req, res) => {
  res.json({
    active: true,
    status: "online",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Health check (deprecated, use /api/status)
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

export default app;
