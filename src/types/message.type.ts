import { Document, Model, Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId;
  text?: string;
  attachments?: string[];
}
export interface IMessageMethods {}

export interface MessageDocument
  extends IMessage,
    IMessageMethods,
    Document<any, {}, IMessage> {
  _id: Types.ObjectId;
  _doc: IMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageModel extends Model<MessageDocument> {}
