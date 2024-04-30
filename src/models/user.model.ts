import bcrypt from "bcrypt";
import crypto from "crypto";
import { model, Query, Schema } from "mongoose";
import { UserDocument, UserModel, UserRole } from "../types/user.type.js";

const userSchema = new Schema<UserDocument, UserModel>(
  {
    username: {
      type: String,
      required: [true, "Please provide your username!"],
      unique: true,
    },
    avatar: String,
    coverImage: String,
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
        "Please provide a valid email address",
      ],
      // validate: {
      //   validator: function (value: string) {
      //     const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
      //     return emailRegex.test(value);
      //   },
      //   message: "Please provide a valid email address",
      // },
    },
    password: {
      type: String,
      select: false,
      required: [true, "Please provide a password"],
      minlength: 8,
    },
    role: {
      type: String,
      enum: UserRole,
      default: UserRole.USER,
    },
    dob: Date,
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privateChats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    groupChats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    resetTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);

  this.password = await bcrypt.hash(this.password, +process.env.SALT_ROUNDS!);
  this.passwordChangedAt = new Date(Date.now() - 1000);

  next();
});

userSchema.pre(/^find/, function (next) {
  if (this instanceof Query) this.select("-__v");
  next();
});

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.checkPasswordChangedAfter = function (jwtTimestamp: Date) {
  if (this.passwordChangedAt) {
    return jwtTimestamp < this.passwordChangedAt;
  }
  return false;
};

userSchema.methods.createForgetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

  return token;
};

userSchema.methods.checkForgetPasswordToken = function (resetToken: string) {
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  if (passwordResetToken !== this.passwordResetToken) return false;
  if (this.resetTokenExpires < new Date(Date.now())) return false;

  return true;
};

export default model<UserDocument, UserModel>("User", userSchema);
