import Site from "@/app/backend/models/siteModel";

export async function findOrCreateSite(domain: string, name?: string) {
  let site = await Site.findOne({ domain });
  if (!site) {
    site = await Site.create({ domain, name });
  }
  return site;
}
