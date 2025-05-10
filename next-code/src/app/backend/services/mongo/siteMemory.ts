import SiteMemory from "@/app/backend/models/siteMemoryModel";

export async function findOrCreateSiteMemory(siteId: string) {
  let siteMemory = await SiteMemory.findOne({ siteId });
  if (!siteMemory) {
    siteMemory = await SiteMemory.create({ siteId, facts: [] });
  }
  return siteMemory;
}
