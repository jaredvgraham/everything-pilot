import { Schema, model, models, Document } from "mongoose";

export interface IUserSiteContext {
  userId: string;
  siteId: Schema.Types.ObjectId;
  facts: string[];
  lastUpdated: Date;
}

const userSiteContextSchema = new Schema({
  userId: { type: String, required: true },
  siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
  facts: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
});

userSiteContextSchema.index({ userId: 1, siteId: 1 }, { unique: true });

const UserSiteContext =
  models.UserSiteContext ||
  model<IUserSiteContext & Document>("UserSiteContext", userSiteContextSchema);
export default UserSiteContext;
