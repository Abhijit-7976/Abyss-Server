import { Document, Model, Types } from "mongoose";

// export enum MemberRole {
//   MASTER = "master",
//   WANDERER = "wanderer",
// }

// interface IMember {
//   user: Types.ObjectId;
//   role: MemberRole;
//   joinedAt: Date;
//   invitedBy: Types.ObjectId;
// }

export interface IChat {
  _id: Types.ObjectId;
  type: "private" | "group";
  name?: string;
  description?: string;
  image?: string;
  members: Types.ObjectId[];
  messages: Types.ObjectId[];
}

export interface ChatMethods {}

export interface ChatDocument extends IChat, ChatMethods, Document {
  _id: Types.ObjectId;
  _doc: IChat;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatModel extends Model<ChatDocument> {}
