// src/app/backend/services/user.ts

import { connectDB } from "../config/mongo";
import User, { IUser } from "../models/userModel";

export const createUser = async (user: IUser) => {
  await connectDB();

  const newUser = await User.create(user);

  return newUser;
};
