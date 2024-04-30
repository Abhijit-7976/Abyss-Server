import { Document, Model, Types } from "mongoose";
import { ChatDocument } from "./chat.type";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser {
  username: string;
  avatar?: string;
  coverImage?: string;
  email: string;
  password: string;
  role: UserRole;
  dob: Date;
  friends: Types.ObjectId[];
  privateChats: Types.DocumentArray<ChatDocument>;
  groupChats: Types.DocumentArray<ChatDocument>;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  resetTokenExpires?: Date;
}

export interface IUserMethods {
  checkPassword: (password: string) => Promise<boolean>;
  checkPasswordChangedAfter: (jwtTimestamp: Date) => boolean;
  createForgetPasswordToken: () => string;
}

export interface UserDocument
  extends IUser,
    IUserMethods,
    Document<any, {}, IUser> {
  _id: Types.ObjectId;
  _doc: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel extends Model<UserDocument> {}
