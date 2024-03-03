import { Schema, model } from "mongoose";
import { IMessage, MessageDocument, MessageModel } from "../types/message.type";

const messageSchema = new Schema<MessageDocument, MessageModel>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a sender!"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    text: String,
    attachments: [String],
  },
  { timestamps: true }
);

export default model<MessageDocument, MessageModel>("Message", messageSchema);
