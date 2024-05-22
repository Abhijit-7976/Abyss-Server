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
  const DbChat = await Chat.findById(chat._id).select("+messages");
  console.log({ DbChat });

  if (!DbChat) {
    throw new Error("Chat not found");
  }

  const newMessage = await Message.create(message);
  console.log({ newMessage });

  DbChat.messages.push(newMessage._id);
  const savedChat = await DbChat.save();

  console.log({ savedChat });
};
