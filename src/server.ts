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
  messageProducer.disconnect();
  messageConsumer.disconnect();
  process.exit(1);
});

import app from "./app.js";
const httpServer = http.createServer(app);

import { connectToDb } from "./db/abyss.js";
import { initializeKafka } from "./kafka/messageAdmin.kafka.js";
import messageConsumer, {
  initMessageConsumer,
} from "./kafka/messageConsumer.kafka.js";
import messageProducer, {
  initMessageProducer,
} from "./kafka/messageProducer.kafka.js";
import { connectMediasoupService } from "./services/mediasoup/mediasoup.ws.js";
import { connectChatService } from "./services/messages/chats.ws.js";

// Connect to database
connectToDb();

// Initialize Kafka for messaging
initializeKafka();
initMessageProducer();
initMessageConsumer();

// Mediasoup and WebSocket
const io = new Server(httpServer, { cors: { origin: "*" } });

connectMediasoupService(io);
connectChatService(io);

// Start server
const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}...`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: string, promise: Promise<any>) => {
  console.log("💥 Unhandled Rejection Shutting down...");
  console.log(reason);
  httpServer.close(() => {
    messageProducer.disconnect();
    messageConsumer.disconnect();
    process.exit(1);
  });
});
