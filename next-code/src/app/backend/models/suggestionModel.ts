import { Schema, model, models, Document } from "mongoose";

export interface ISuggestion {
  userId: string;
  siteId?: Schema.Types.ObjectId;
  input: string;
  output: string;
  createdAt: Date;
}

const suggestionSchema = new Schema({
  userId: { type: String, required: true },
  siteId: { type: Schema.Types.ObjectId, ref: "Site" },
  input: { type: String, required: true },
  output: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Suggestion =
  models.Suggestion ||
  model<ISuggestion & Document>("Suggestion", suggestionSchema);

export default Suggestion;
