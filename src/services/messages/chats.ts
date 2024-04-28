import { Server } from "socket.io";

export function connectChatService(io: Server) {
  const chatsIo = io.of("/chats");

  chatsIo.on("connection", socket => {
    console.log("📱 chats client connected...");

    socket.on("test", () => {
      console.log("📱 chats test event received...");
    });

    socket.on("disconnect", () => {
      console.log("📱❌ chats client disconnected...");
    });
  });
}
