import { Schema, model, models, Document } from "mongoose";

export interface ISite {
  domain: string;
  name?: string;
  createdAt: Date;
}

const siteSchema = new Schema({
  domain: { type: String, required: true, unique: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Site = models.Site || model<ISite & Document>("Site", siteSchema);
export default Site;
