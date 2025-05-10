import UserMemory from "@/app/backend/models/userMemoryModel";
import SiteMemory from "@/app/backend/models/siteMemoryModel";
import UserSiteContext from "@/app/backend/models/userSiteContextModel";
import SessionMemory from "@/app/backend/models/sessionMemoryModel";

export async function findOrCreateUserMemory(userId: string) {
  let userMemory = await UserMemory.findOne({ userId });
  if (!userMemory) {
    userMemory = await UserMemory.create({ userId, facts: [] });
  }
  return userMemory;
}

export async function getAllUserMemory(userId: string) {
  const userMemory = await UserMemory.findOne({ userId });
  const siteMemories = await SiteMemory.find({ userId });
  const userSiteContexts = await UserSiteContext.find({ userId });
  const sessionMemories = await SessionMemory.find({ userId });
  return {
    userMemory,
    siteMemories,
    userSiteContexts,
    sessionMemories,
  };
}
