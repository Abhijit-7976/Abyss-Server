import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import User from "../models/user.model.js";
import { ApiRequest } from "../types/auth.type.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/email.js";

const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const savedUser = await User.create(req.body);

  const token = signToken(savedUser._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(201, { user: savedUser, token }, "User created"));
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password)
    throw new ApiError("Please provide email and password", 400);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkPassword(password)))
    throw new ApiError("Incorrect email or password", 401);

  const token = signToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, { token }, "Token generated."));
});

export const logout = catchAsync(async (req: ApiRequest, res, next) => {
  req.user = undefined;
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("token", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// TODO: Add forgotPassword
export const forgotPassword = catchAsync(async (req, res, next) => {
  console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError("There is no user with email address", 404);

  const resetToken = user.createForgetPasswordToken();
  user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  console.log(resetURL);

  const message = `Forgot your password? Click the link below to reset your password. \n${resetURL} \nIf you didn't forget your password, please ignore this email!`;

  try {
    const emailRes = await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { resetURL },
          "Password reset link sent to the user."
        )
      );
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      "There was an error sending the email. Try again later!",
      500
    );
  }
});

// TODO: resetPassword
export const resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.resetToken;
  const { newPassword } = req.body;

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    throw new ApiError("Password reset token is invalid or expired", 400);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;

  const savedUser = await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, { savedUser }, "Password reset successfully"));
});

// TODO: updatePassword
export const updateUserPassword = catchAsync(
  async (req: ApiRequest, res, next) => {
    const loggedInUser = req.user!;
    if (!req.body.currentPassword)
      throw new ApiError("Please provide current password", 400);

    const user = await User.findById(loggedInUser._id).select("+password");

    if (!user || !(await user.checkPassword(req.body.currentPassword)))
      throw new ApiError(
        `User no longer exists or current password is incorrect`,
        404
      );

    user.password = req.body.newPassword;
    const updatedUser = await user.save({ validateModifiedOnly: true });
    const token = signToken(loggedInUser._id);

    res
      .status(200)
      .json(
        new ApiResponse(200, { user: updatedUser, token }, "Password updated")
      );
  }
);
