import { Types } from "mongoose";
import { type Server, type Socket } from "socket.io";
import { addMessageToDb } from "../../controllers/message.controller.js";
import { IChat } from "../../types/chat.type";

const socketToUser = new Map<string, string>();
const userToSocket = new Map<string, string>();

export function connectChatService(io: Server) {
  const chatsIo = io.of("/chats");

  chatsIo.on("connection", (socket: Socket) => {
    // user first connects to the chat service
    socket.on("user_connected", ({ userId }) => {
      console.log("🕹️  user connected:", { userId, socketId: socket.id });
      socketToUser.set(socket.id, userId);
      userToSocket.set(userId, socket.id);
    });

    // user sends a message
    socket.on("send-message", async ({ sender, chat, message }, callback) => {
      console.log("📱📤 send-message:", { sender, chat, message });
      message._id = new Types.ObjectId();
      message.sender = sender;
      message.createdAt = new Date();

      addMessageToDb({ chat, message });

      chat.members.forEach((member: Types.ObjectId) => {
        const memberSocket = userToSocket.get(member.toString());
        if (memberSocket) {
          socket.to(memberSocket).emit("new-message", { chat, message });
        }
      });

      callback({ chat, message });
    });

    socket.on("disconnect", () => {
      console.log("📱❌ chats client disconnected...");
      const userId = socketToUser.get(socket.id)!;
      socketToUser.delete(socket.id);
      userToSocket.delete(userId);
    });
  });
}
