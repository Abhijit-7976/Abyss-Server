import { Query, Schema, model } from "mongoose";
import { ChatDocument, ChatModel } from "../types/chat.type";

// const memberSchema = new Schema(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Please provide a user for the member"],
//     },
//     role: {
//       type: String,
//       enum: MemberRole,
//       default: MemberRole.WANDERER,
//       required: [true, "Please provide a role for the member"],
//     },
//     joinedAt: { type: Date, required: true, default: Date.now() },
//     invitedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Please provide a user who invited the member"],
//     },
//   },
//   { _id: false }
// );

const chatSchema = new Schema<ChatDocument, ChatModel>(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: [true, "Please provide chats type"],
    },
    name: {
      type: String,
      unique: true,
    },
    description: String,
    image: String,
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Message",
        },
      ],
      select: false,
    },
  },
  { timestamps: true }
);

chatSchema.pre(/^find/, function (next) {
  if (this instanceof Query) this.select("-__v");
  next();
});

export default model<ChatDocument, ChatModel>("Chat", chatSchema);
