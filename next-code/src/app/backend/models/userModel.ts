// src/app/backend/models/userModel.ts

import { Schema, model, models } from "mongoose";

export interface IUser {
  clerkId: string;
  email: string;
  plan: "none" | "basic" | "pro";
  createdAt: Date;
}

const userSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    required: true,
    default: "none",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = models.User || model<IUser>("User", userSchema);

export default User;
