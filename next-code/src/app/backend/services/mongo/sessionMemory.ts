import SessionMemory from "@/app/backend/models/sessionMemoryModel";

export async function findOrCreateSessionMemory(
  userId: string,
  siteId: string,
  conversationId: string
) {
  let session = await SessionMemory.findOne({ userId, siteId, conversationId });
  if (!session) {
    session = await SessionMemory.create({
      userId,
      siteId,
      conversationId,
      recentInputs: [],
      recentCompletions: [],
    });
  }
  return session;
}
