import dotenv from "dotenv";
import http, { get } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { connectToDb } from "./db/abyss.js";
import { connectChatService } from "./services/chats.ws.js";
import {
  createMessageConsumer,
  createMessageProducer,
  initializeKafka,
} from "./services/kafka.js";
import { connectMediasoupService } from "./services/mediasoup.ws.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Handle uncaught exceptions
process.on("uncaughtException", err => {
  console.log("💥 Uncaught Exception Shutting down...");
  console.log(err.name, err.message);
  createMessageConsumer().then(consumer => consumer.disconnect());
  createMessageProducer().then(producer => producer.disconnect());
  process.exit(1);
});

import app from "./app.js";
const httpServer = http.createServer(app);

(async () => {
  // Connect to database
  await connectToDb();

  // Initialize Kafka for messaging
  await initializeKafka();
  await createMessageConsumer();
})();

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
    createMessageConsumer().then(consumer => consumer.disconnect());
    createMessageProducer().then(producer => producer.disconnect());
    process.exit(1);
  });
});
