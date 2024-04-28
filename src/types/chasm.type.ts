import { Document, Model, Types } from "mongoose";

export enum MemberRole {
  MASTER = "master",
  WANDERER = "wanderer",
}

interface IMember {
  user: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
  invitedBy: Types.ObjectId;
}

export interface IChasm {
  name: string;
  description?: string;
  image?: string;
  creator: Types.ObjectId;
  members: Types.DocumentArray<IMember>;
  messages?: Types.ObjectId[];
}

export interface ChasmMethods {}

export interface ChasmDocument extends IChasm, ChasmMethods, Document {
  _id: Types.ObjectId;
  _doc: IChasm;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChasmModel extends Model<ChasmDocument> {}
