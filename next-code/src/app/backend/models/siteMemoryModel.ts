import { Schema, model, models, Document } from "mongoose";

export interface ISiteMemory {
  userId: string;
  siteId: Schema.Types.ObjectId;
  facts: string[];
  lastUpdated: Date;
}

const siteMemorySchema = new Schema({
  userId: { type: String, required: true },
  siteId: {
    type: Schema.Types.ObjectId,
    ref: "Site",
    required: true,
  },
  facts: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
});

const SiteMemory =
  models.SiteMemory ||
  model<ISiteMemory & Document>("SiteMemory", siteMemorySchema);
export default SiteMemory;
