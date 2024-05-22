import path from "path";
import User from "../models/user.model.js";
import { ApiRequest } from "../types/auth.type.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { deleteOne, findAll, findOne } from "./handleFactory.js";

// Do not update password
export const updateUserDetails = catchAsync(
  async (req: ApiRequest, res, next) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError("No user found", 404);
    const { email, username } = req.body;

    if (!username && !email)
      throw new ApiError("Please provide user new details", 400);

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, req.body, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { user: updatedUser }, "User updated"));
  }
);

export const uploadAvatar = catchAsync(async (req: ApiRequest, res, next) => {
  const avatarLocalPath = req.file?.path;
  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError("No user found", 404);
  if (!avatarLocalPath) throw new ApiError("Please provide an image", 400);

  const uploadRes = await uploadToCloudinary(avatarLocalPath);

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: uploadRes.secure_url } },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, "User updated"));
});

export const uploadCoverImage = catchAsync(
  async (req: ApiRequest, res, next) => {
    const coverImageLocalPath = req.file?.path;
    const user = await User.findById(req.user?._id);

    if (!user) throw new ApiError("No user found", 404);
    if (!coverImageLocalPath)
      throw new ApiError("Please provide an image", 400);

    const uploadRes = await uploadToCloudinary(coverImageLocalPath);

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { coverImage: uploadRes.secure_url } },
      { new: true }
    );

    res
      .status(200)
      .json(new ApiResponse(200, { user: updatedUser }, "User updated"));
  }
);

export const addFriend = catchAsync(async (req: ApiRequest, res, next) => {
  const user = await User.findById(req.user?._id);
  const friend = await User.findOne({ username: req.params.friendUsername });

  if (!user || !friend) throw new ApiError("No user found", 404);

  if (user.friends.includes(friend._id))
    throw new ApiError("User is already a friend", 400);

  user.friends.push(friend._id);
  friend.friends.push(user._id);

  await user.save();
  await friend.save();

  res.status(200).json(new ApiResponse(200, { user }, "Friend added"));
});

export const getFriends = catchAsync(async (req: ApiRequest, res, next) => {
  const page = req.query.page ? +req.query.page : 1;
  const limit = req.query.limit ? +req.query.limit : 20;
  const search = (req.query.search as string) || "";

  const user = await User.findById(req.user?._id).populate({
    path: "friends",
    match: { username: new RegExp(search, "i") },
    options: { skip: (page - 1) * limit, limit: limit + 1 },
  });

  if (!user) throw new ApiError("No user found", 404);

  const isLast = user.friends.length <= limit;
  if (!isLast) user.friends.pop();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { page, isLast, friends: user.friends },
        "Friends found"
      )
    );
});

export const getAllUsers = catchAsync(async (req: ApiRequest, res, next) => {
  const page = req.query.page ? +req.query.page : 1;
  const limit = req.query.limit ? +req.query.limit : 20;
  const search = (req.query.search as string) || "";

  const users = await User.find({
    $and: [
      { username: new RegExp(search, "i") },
      { _id: { $ne: req.user?._id } },
    ],
  })
    .skip((page - 1) * limit)
    .limit(limit + 1);

  const isLast = users.length <= limit;
  if (!isLast) users.pop();

  res
    .status(200)
    .json(new ApiResponse(200, { page, isLast, users }, "Users found"));
});

export const getAllUnknownUsers = catchAsync(
  async (req: ApiRequest, res, next) => {
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 20;
    const search = (req.query.search as string) || "";

    const users = await User.find({
      $and: [
        { username: new RegExp(search, "i") },
        { _id: { $ne: req.user?._id } },
        { _id: { $nin: req.user?.friends } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit + 1);

    const isLast = users.length <= limit;
    if (!isLast) users.pop();

    res
      .status(200)
      .json(new ApiResponse(200, { page, isLast, users }, "Users found"));
  }
);

export const getUser = findOne(User);
export const deleteUser = deleteOne(User);
