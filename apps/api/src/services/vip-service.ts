import type { PrismaClient, User } from "@prisma/client";

export async function synchronizeVip(
  prisma: PrismaClient,
  userId: string
): Promise<Pick<User, "id" | "username" | "role" | "isVip" | "vipExpiresAt"> | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      role: true,
      isVip: true,
      vipExpiresAt: true
    }
  });

  if (!user) return null;

  if (user.isVip && (!user.vipExpiresAt || user.vipExpiresAt <= new Date())) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVip: false, vipExpiresAt: null },
      select: {
        id: true,
        username: true,
        role: true,
        isVip: true,
        vipExpiresAt: true
      }
    });
  }

  return user;
}
