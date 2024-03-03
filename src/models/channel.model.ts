import { Schema, model } from "mongoose";
import { ChannelDocument, ChannelModel } from "../types/channel.types";

const channelSchema = new Schema<ChannelDocument, ChannelModel>(
  {
    name: {
      type: String,
      required: [true, "Please provide a channel name!"],
    },
    description: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the user who created the channel!"],
    },
    messages: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Message",
        },
      ],
    },
  },
  { timestamps: true }
);

export default model<ChannelDocument, ChannelModel>("Channel", channelSchema);
