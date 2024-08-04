import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import type { IChat } from "../types/chat.type.js";
import type { IMessage } from "../types/message.type.js";

export const addMessageToDb = async ({
  chat,
  message,
}: {
  chat: IChat;
  message: IMessage;
}) => {
  if (!chat || !message) {
    throw new Error("Chat or message not provided");
  }

  const DbChat = await Chat.findById(chat._id).select("+messages");

  if (!DbChat) {
    throw new Error("Chat not found");
  }

  const newMessage = await Message.create(message);

  DbChat.messages.push(newMessage._id);
  await DbChat.save();
};
