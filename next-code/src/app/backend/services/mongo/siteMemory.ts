import SiteMemory from "@/app/backend/models/siteMemoryModel";

export async function findOrCreateSiteMemory(userId: string, siteId: string) {
  let siteMemory = await SiteMemory.findOne({ userId, siteId });
  if (!siteMemory) {
    siteMemory = await SiteMemory.create({ userId, siteId, facts: [] });
  }
  return siteMemory;
}
