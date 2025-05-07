// src/app/backend/services/user.ts

import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "../config/mongo";
import User, { IUser } from "../models/userModel";

export const createUser = async (user: IUser) => {
  await connectDB();

  const userExists = await User.findOne({ email: user.email });
  if (userExists) {
    throw new Error("User already exists");
  }

  const newUser = await User.create(user);
  const client = await clerkClient();

  await client.users.updateUser(newUser.clerkId, {
    publicMetadata: {
      plan: "none",
    },
  });

  return newUser;
};
