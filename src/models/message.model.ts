import { Query, Schema, model } from "mongoose";
import { IMessage, MessageDocument, MessageModel } from "../types/message.type";

const messageSchema = new Schema<MessageDocument, MessageModel>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a sender!"],
    },
    text: String,
    attachments: [String],
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function (next) {
  if (this instanceof Query) this.select("-__v");
  next();
});

export default model<MessageDocument, MessageModel>("Message", messageSchema);
