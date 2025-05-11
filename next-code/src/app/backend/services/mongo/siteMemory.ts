import SiteMemory from "@/app/backend/models/siteMemoryModel";

export async function findOrCreateSiteMemory(userId: string, siteId: string) {
  console.log("finding or creating site memory for", userId, siteId);
  let siteMemory = await SiteMemory.findOne({ userId, siteId });
  if (!siteMemory) {
    siteMemory = await SiteMemory.create({ userId, siteId, facts: [] });
    console.log("site memory created", siteMemory);
  }
  console.log("site memory found", siteMemory);
  return siteMemory;
}
