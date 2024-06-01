import dotenv from "dotenv";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Handle uncaught exceptions
process.on("uncaughtException", err => {
  console.log("💥 Uncaught Exception Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./app.js";
const server = http.createServer(app);

import { connectToDb } from "./db/abyss.js";
import { connectMediasoupService } from "./services/mediasoup/mediasoup.ws.js";
import { connectChatService } from "./services/messages/chats.ws.js";

// Connect to database
connectToDb();

// Mediasoup and WebSocket
const io = new Server(server, {
  path: "/ws",
  cors: { origin: "*" },
});

connectMediasoupService(io);
connectChatService(io);

// Start server
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}...`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: string, promise: Promise<any>) => {
  console.log("💥 Unhandled Rejection Shutting down...");
  console.log(reason);
  server.close(() => {
    process.exit(1);
  });
});
