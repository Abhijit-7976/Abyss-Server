import { Types, isObjectIdOrHexString } from "mongoose";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { ApiRequest } from "../types/auth.type.js";
import { ChatDocument } from "../types/chat.type.js";
import { MessageDocument } from "../types/message.type.js";
import { UserDocument } from "../types/user.type.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

// Create a private chat
export const createPrivateChat = catchAsync(
  async (req: ApiRequest, res, next) => {
    const friendId = req.body.friendId;
    const message = req.body.message;

    const user = await User.findById(req.user?._id);
    const friend = await User.findById(friendId);

    if (!user || !friend) return next(new ApiError("No user found", 404));

    const chat1 = await Chat.findOne({
      $or: [
        { name: `${user.username} and ${friend.username}` },
        { name: `${friend.username} and ${user.username}` },
      ],
    });

    if (chat1) {
      return next(new ApiError("Chat already exists", 400));
    }

    // First message
    const newMessage = await Message.create({
      sender: user._id,
      text: message,
    });

    const privateChat = await Chat.create({
      name: `${user.username} and ${friend.username}`,
      type: "private",
      members: [user._id, friend._id],
      messages: [newMessage._id],
    });

    user.privateChats.push(privateChat);
    friend.privateChats.push(privateChat);

    // Add to user's friends list and friend's friends list
    if (!user.friends.includes(friend._id)) user.friends.push(friend._id);
    if (!friend.friends.includes(user._id)) friend.friends.push(user._id);

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

  if (chat.type === "private") {
    const members = chat.members.filter(
      member => !member.equals(req.user?._id)
    );
    const friend = await User.findById(members[0]);
    chat.name = friend?.username;
    chat.image = friend?.avatar;
  }

  res.status(200).json(new ApiResponse(200, { chat }, "Chat found"));
});

// Get all private chats
export const getAllPrivateChats = catchAsync(
  async (req: ApiRequest, res, next) => {
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 20;
    const search = (req.query.search as string) || "";

    const user = await User.findById(req.user?._id);
    if (!user) return next(new ApiError("No user found", 404));

    const privateChatsAggregate = await User.aggregate([
      { $match: { _id: req.user?._id } },
      {
        $lookup: {
          from: "chats",
          localField: "privateChats",
          foreignField: "_id",
          as: "privateChats",
        },
      },
      {
        $unwind: "$privateChats",
      },
      {
        $lookup: {
          from: "users",
          localField: "privateChats.members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $unwind: "$members",
      },
      {
        $match: {
          "members._id": { $ne: req.user?._id },
          "members.username": new RegExp(search, "i"),
        },
      },
      { $sort: { "privateChats.updatedAt": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit + 1 },
      {
        $group: {
          _id: "$_id",
          privateChats: { $push: "$privateChats" },
        },
      },
    ]);

    let privateChats: Array<ChatDocument> = [];
    let isLast = true;

    if (privateChatsAggregate[0]) {
      privateChats = privateChatsAggregate[0].privateChats;
      isLast = privateChats.length <= limit;

      if (!isLast) privateChats.pop();

      for (const chat of privateChats) {
        const member = chat.members.filter(member => !member.equals(user._id));
        const friend = await User.findById(member[0]);

        chat.name = friend?.username;
        chat.image = friend?.avatar;
      }
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { page, isLast, chats: privateChats },
          "Private chats found"
        )
      );
  }
);

// Get all group chats
export const getAllGroupChats = catchAsync(
  async (req: ApiRequest, res, next) => {
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 20;
    const search = (req.query.search as string) || "";

    const user = await User.findById(req.user?._id);

    if (!user) return next(new ApiError("No user found", 404));

    const groupChatsAggregate = await User.aggregate([
      { $match: { _id: req.user?._id } },
      {
        $lookup: {
          from: "chats",
          localField: "groupChats",
          foreignField: "_id",
          as: "groupChats",
        },
      },
      {
        $unwind: "$groupChats",
      },
      { $match: { "groupChats.name": new RegExp(search, "i") } },
      { $sort: { "groupChats.updatedAt": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit + 1 },
      {
        $group: {
          _id: "$_id",
          groupChats: { $push: "$groupChats" },
        },
      },
    ]);

    let groupChats: Array<ChatDocument> = [];
    let isLast = true;

    if (groupChatsAggregate[0]) {
      groupChats = groupChatsAggregate[0].groupChats;
      isLast = groupChats.length <= limit;

      if (!isLast) groupChats.pop();
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { page, isLast, chats: groupChats },
          "Group chats found"
        )
      );
  }
);

// Messages

// Send a message temp ---------------------------------------------
export const sendMessage = catchAsync(async (req: ApiRequest, res, next) => {
  const chatId = req.params.chatId;
  const text = req.body.text;

  const chat = await Chat.findById(chatId).select("+messages");
  if (!chat) return next(new ApiError("No chat found", 404));
  const newMessage = await Message.create({ sender: req.user?._id, text });

  chat.messages.push(newMessage._id);
  await chat.save();

  res.status(200).json(new ApiResponse(200, { chat }, "Chat found"));
});

//------------------------------------------------------------------

export const getChatMessages = catchAsync(
  async (req: ApiRequest, res, next) => {
    const chatId = req.params.chatId;
    const limit = req.query.limit ? +req.query.limit : 20;
    const cursor = req.query.cursor
      ? new Types.ObjectId(req.query.cursor as string)
      : new Types.ObjectId();

    const user = await User.findById(req.user?._id);
    if (!user) return next(new ApiError("No user found", 404));

    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ApiError("No chat found", 404));

    const messagesAggregate = await Chat.aggregate([
      { $match: { _id: chat._id } },
      {
        $lookup: {
          from: "messages",
          localField: "messages",
          foreignField: "_id",
          as: "messages",
        },
      },
      { $unwind: "$messages" },
      { $match: { "messages._id": { $lt: cursor } } },
      { $sort: { "messages.createdAt": -1 } },
      { $limit: limit + 1 },
      {
        $lookup: {
          from: "users",
          localField: "messages.sender",
          foreignField: "_id",
          as: "messages.sender",
        },
      },
      { $unwind: "$messages.sender" },
      {
        $project: {
          "messages.sender.coverImage": false,
          "messages.sender.password": false,
          "messages.sender.friends": false,
          "messages.sender.privateChats": false,
          "messages.sender.groupChats": false,
          "messages.sender.createdAt": false,
          "messages.sender.updatedAt": false,
          "messages.sender.passwordChangedAt": false,
          "messages.sender.role": false,
          "messages.sender.__v": false,
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
    ]);

    let messages: Array<MessageDocument> = [];
    let hasNext = false;
    let lastCursor: Types.ObjectId | undefined = undefined;
    console.log({ length: messagesAggregate.length });

    if (messagesAggregate[0]) {
      messages = messagesAggregate[0].messages;
      hasNext = messages.length > limit;

      if (hasNext) messages.pop();
      if (hasNext) lastCursor = messages[messages.length - 1]._id;
    }

    messages = messages.reverse();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { hasNext, lastCursor, messages },
          "Chat messages found"
        )
      );
  }
);
