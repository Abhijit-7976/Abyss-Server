import { Document, Model, Types } from "mongoose";

export interface IChannel {
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  messages: Types.ObjectId[];
}

export interface IChannelMethods {}

export interface ChannelDocument
  extends IChannel,
    IChannelMethods,
    Document<unknown, {}, IChannel> {
  _id: Types.ObjectId;
  _doc: IChannel;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelModel extends Model<ChannelDocument> {}
