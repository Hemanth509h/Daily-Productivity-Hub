import app from "./app.js";
import { logger } from "./lib/logger.js";
import dotenv from "dotenv";

dotenv.config();

const port = parseInt(process.env.PORT || "3001", 10);

const server = app.listen(port, () => {
  logger.info({ port }, "Server is running in %s mode", process.env.NODE_ENV || "development");
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});
