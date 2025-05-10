import UserSiteContext from "@/app/backend/models/userSiteContextModel";

export async function findOrCreateUserSiteContext(
  userId: string,
  siteId: string
) {
  let ctx = await UserSiteContext.findOne({ userId, siteId });
  if (!ctx) {
    ctx = await UserSiteContext.create({ userId, siteId, facts: [] });
  }
  return ctx;
}
