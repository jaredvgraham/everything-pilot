import UserMemory from "@/app/backend/models/userMemoryModel";

export async function findOrCreateUserMemory(userId: string) {
  let userMemory = await UserMemory.findOne({ userId });
  if (!userMemory) {
    userMemory = await UserMemory.create({ userId, facts: [] });
  }
  return userMemory;
}
