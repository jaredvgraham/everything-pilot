import { Schema, model, models, Document } from "mongoose";

export interface ISessionMemory {
  userId: string;
  siteId: Schema.Types.ObjectId;
  conversationId: string;
  recentInputs: string[];
  recentCompletions: string[];
  lastUpdated: Date;
}

const sessionMemorySchema = new Schema({
  userId: { type: String, required: true },
  siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
  conversationId: { type: String, required: true },
  recentInputs: [{ type: String }],
  recentCompletions: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
});

sessionMemorySchema.index(
  { userId: 1, siteId: 1, conversationId: 1 },
  { unique: true }
);

const SessionMemory =
  models.SessionMemory ||
  model<ISessionMemory & Document>("SessionMemory", sessionMemorySchema);
export default SessionMemory;
