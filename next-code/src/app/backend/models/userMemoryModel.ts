import { Schema, model, models, Document } from "mongoose";

export interface IUserMemory {
  userId: string;
  facts: string[];
  lastUpdated: Date;
}

const userMemorySchema = new Schema({
  userId: { type: String, required: true, unique: true },
  facts: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
});

const UserMemory =
  models.UserMemory ||
  model<IUserMemory & Document>("UserMemory", userMemorySchema);
export default UserMemory;
