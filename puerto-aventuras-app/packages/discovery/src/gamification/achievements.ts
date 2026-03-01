/**
 * Gamification - Achievements Module
 *
 * Achievement tracking and milestones
 */

import type { PrismaClient } from '@pa/database';
import type { BadgeData } from '../types';

/**
 * Gets all achievements (badges) available
 *
 * @param prisma - Prisma client instance
 * @returns Array of all badges
 */
export async function getAllAchievements(
  prisma: PrismaClient
): Promise<BadgeData[]> {
  const badges = await prisma.badge.findMany({
    orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
  });

  return badges as unknown as BadgeData[];
}

/**
 * Gets achievements by rarity
 *
 * @param rarity - Badge rarity
 * @param prisma - Prisma client instance
 * @returns Array of badges with the specified rarity
 */
export async function getAchievementsByRarity(
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
  prisma: PrismaClient
): Promise<BadgeData[]> {
  const badges = await prisma.badge.findMany({
    where: { rarity },
    orderBy: { name: 'asc' },
  });

  return badges as unknown as BadgeData[];
}

/**
 * Gets user's unlocked achievements
 *
 * @param userId - User ID
 * @param prisma - Prisma client instance
 * @returns Array of unlocked badges
 */
export async function getUserAchievements(
  userId: string,
  prisma: PrismaClient
): Promise<Array<BadgeData & { unlockedAt: Date | null }>> {
  const userBadges = await prisma.userBadge.findMany({
    where: {
      userId,
      unlocked: true,
    },
    include: {
      badge: true,
    },
    orderBy: { unlockedAt: 'desc' },
  });

  return userBadges.map((ub) => ({
    ...(ub.badge as unknown as BadgeData),
    unlockedAt: ub.unlockedAt,
  }));
}

/**
 * Gets user's locked achievements (in progress)
 *
 * @param userId - User ID
 * @param prisma - Prisma client instance
 * @returns Array of locked badges with progress
 */
export async function getUserLockedAchievements(
  userId: string,
  prisma: PrismaClient
): Promise<Array<BadgeData & { progress: number; required: number }>> {
  const userBadges = await prisma.userBadge.findMany({
    where: {
      userId,
      unlocked: false,
    },
    include: {
      badge: true,
    },
  });

  return userBadges.map((ub) => ({
    ...(ub.badge as unknown as BadgeData),
    progress: ub.progress,
    required: ub.badge.requirementValue,
  }));
}

/**
 * Gets achievement statistics for a user
 *
 * @param userId - User ID
 * @param prisma - Prisma client instance
 * @returns Achievement statistics
 */
export async function getAchievementStats(
  userId: string,
  prisma: PrismaClient
): Promise<{
  totalUnlocked: number;
  totalAvailable: number;
  completionRate: number;
  byRarity: Record<string, number>;
}> {
  const [unlockedCount, totalCount] = await Promise.all([
    prisma.userBadge.count({
      where: { userId, unlocked: true },
    }),
    prisma.badge.count(),
  ]);

  const byRarityResult = await prisma.userBadge.groupBy({
    by: ['badgeId'],
    where: { userId, unlocked: true },
    _count: true,
  });

  const byRarity: Record<string, number> = {
    COMMON: 0,
    RARE: 0,
    EPIC: 0,
    LEGENDARY: 0,
  };

  for (const result of byRarityResult) {
    const badge = await prisma.badge.findUnique({
      where: { id: result.badgeId },
    });
    if (badge?.rarity) {
      const rarity = badge.rarity;
      const currentValue = byRarity[rarity] ?? 0;
      byRarity[rarity] = currentValue + 1;
    }
  }

  return {
    totalUnlocked: unlockedCount,
    totalAvailable: totalCount,
    completionRate: totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0,
    byRarity,
  };
}

// Re-export types
export type { BadgeData };
