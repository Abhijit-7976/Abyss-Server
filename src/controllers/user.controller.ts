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

export const getAllUsers = findAll(User);
export const getUser = findOne(User);
export const deleteUser = deleteOne(User);
