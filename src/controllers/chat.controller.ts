import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { ApiRequest } from "../types/auth.type.js";
import { ChatDocument } from "../types/chat.type.js";
import { UserDocument } from "../types/user.type.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

// Create a private chat
export const createPrivateChat = catchAsync(
  async (req: ApiRequest, res, next) => {
    const friendId = req.body.friendId;

    const user = await User.findById(req.user?._id);
    const friend = await User.findById(friendId);

    if (!user || !friend) return next(new ApiError("No user found", 404));

    const privateChat = await Chat.create({
      type: "private",
      members: [user._id, friend._id],
    });

    user.privateChats.push(privateChat);
    friend.privateChats.push(privateChat);

    await user.save();
    await friend.save();

    res
      .status(201)
      .json(new ApiResponse(201, { chat: privateChat }, "Chat created"));
  }
);

// Create a group chat
export const createGroupChat = catchAsync(
  async (req: ApiRequest, res, next) => {
    const { name, friendIds } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) return next(new ApiError("No user found", 404));

    const members: Array<UserDocument> = [];

    for (const friendId of friendIds) {
      const friend = await User.findById(friendId);
      if (!friend) return next(new ApiError("No user found", 404));

      members.push(friend);
    }

    const groupChat = await Chat.create({
      name,
      type: "group",
      members: [user._id, ...friendIds],
    });

    user.groupChats.push(groupChat);
    await user.save();

    members.forEach(async member => {
      member.groupChats.push(groupChat);
      await member.save();
    });

    res
      .status(201)
      .json(new ApiResponse(201, { chat: groupChat }, "Chat created"));
  }
);

// Get a chat
export const getChat = catchAsync(async (req: ApiRequest, res, next) => {
  const chatId = req.params.chatId;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ApiError("No chat found", 404));

  res.status(200).json(new ApiResponse(200, { chat }, "Chat found"));
});

// Get all private chats
export const getAllPrivateChats = catchAsync(
  async (req: ApiRequest, res, next) => {
    const user = await User.findById(req.user?._id).populate("privateChats");
    if (!user) return next(new ApiError("No user found", 404));

    const privateChats: Array<ChatDocument> = [];

    for (const chat of user.privateChats) {
      const member = chat.members.filter(member => !member.equals(user._id));
      const friend = await User.findById(member[0]);

      chat.name = friend?.username;
      chat.image = friend?.avatar;

      privateChats.push(chat);
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { chats: privateChats }, "Private chats found")
      );
  }
);

// Get all group chats
export const getAllGroupChats = catchAsync(
  async (req: ApiRequest, res, next) => {
    const user = await User.findById(req.user?._id).populate("groupChats");
    if (!user) return next(new ApiError("No user found", 404));

    res
      .status(200)
      .json(
        new ApiResponse(200, { chats: user.groupChats }, "Group chats found")
      );
  }
);
