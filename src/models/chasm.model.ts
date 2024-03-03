import { Schema, model } from "mongoose";
import { ChasmDocument, ChasmModel, MemberRole } from "../types/chasm.type";

const memberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user for the member"],
    },
    role: {
      type: String,
      enum: MemberRole,
      default: MemberRole.WANDERER,
      required: [true, "Please provide a role for the member"],
    },
    joinedAt: { type: Date, required: true, default: Date.now() },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user who invited the member"],
    },
  },
  { _id: false }
);

const chasmSchema = new Schema<ChasmDocument, ChasmModel>(
  {
    name: {
      type: String,
      required: [true, "Please provide a chasm name!"],
    },
    description: String,
    image: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a creator for the chasm"],
    },
    members: [memberSchema],
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    textChannels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    voiceChannels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
  },
  { timestamps: true }
);

export default model<ChasmDocument, ChasmModel>("Chasm", chasmSchema);
