/**
 * Gamification - Leaderboard Module
 *
 * Leaderboard generation and management
 */

import type { PrismaClient } from '@pa/database';
import type { LeaderboardData, LeaderboardEntry, LeaderboardPeriod } from '../types';

/**
 * Gets the current leaderboard
 *
 * @param period - Time period for leaderboard
 * @param limit - Maximum entries to return
 * @param prisma - Prisma client instance
 * @returns Leaderboard data
 */
export async function getLeaderboard(
  period: LeaderboardPeriod = 'ALL_TIME' as LeaderboardPeriod,
  limit: number = 100,
  prisma: PrismaClient
): Promise<LeaderboardData> {
  // Get date range based on period
  const startDate = getPeriodStartDate(period);

  // Build query based on period
  const where: any = {};
  if (startDate) {
    where.createdAt = { gte: startDate };
  }

  // Fetch top users by points
  const profiles = await prisma.userGamification.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { totalPoints: 'desc' },
    take: limit,
  });

  const rankings: LeaderboardEntry[] = profiles.map((profile, index) => ({
    rank: index + 1,
    userId: profile.userId,
    firstName: profile.user.firstName,
    lastName: profile.user.lastName,
    totalPoints: profile.totalPoints,
    currentLevel: profile.currentLevel,
    currentStreak: profile.currentStreak,
  }));

  return {
    id: `leaderboard-${period}`,
    period,
    startDate: startDate ?? new Date(0),
    endDate: new Date(),
    rankings,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Gets a user's rank on the leaderboard
 *
 * @param userId - User ID
 * @param period - Time period
 * @param prisma - Prisma client instance
 * @returns User's rank or null
 */
export async function getUserRank(
  userId: string,
  period: LeaderboardPeriod = 'ALL_TIME' as LeaderboardPeriod,
  prisma: PrismaClient
): Promise<number | null> {
  const startDate = getPeriodStartDate(period);

  const where: any = {
    totalPoints: { gt: 0 },
  };

  if (startDate) {
    where.createdAt = { gte: startDate };
  }

  const count = await prisma.userGamification.count({
    where: {
      ...where,
      totalPoints: {
        gt: await prisma.userGamification
          .findUnique({
            where: { userId },
          })
          .then((p) => p?.totalPoints ?? 0),
      },
    },
  });

  return count + 1;
}

/**
 * Refreshes the leaderboard cache
 *
 * @param period - Time period
 * @param prisma - Prisma client instance
 */
export async function refreshLeaderboard(
  period: LeaderboardPeriod,
  prisma: PrismaClient
): Promise<LeaderboardData> {
  const leaderboard = await getLeaderboard(period, 100, prisma);

  // Store cached leaderboard
  await prisma.leaderboard.upsert({
    where: { id: `leaderboard-${period}` },
    create: {
      id: `leaderboard-${period}`,
      period,
      startDate: leaderboard.startDate,
      rankings: JSON.stringify(leaderboard.rankings),
    },
    update: {
      rankings: JSON.stringify(leaderboard.rankings),
      updatedAt: new Date(),
    },
  });

  return leaderboard;
}

/**
 * Gets the start date for a time period
 */
function getPeriodStartDate(period: LeaderboardPeriod): Date | null {
  const now = new Date();

  switch (period) {
    case 'DAILY':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'WEEKLY':
      const dayOfWeek = now.getDay();
      return new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
    case 'MONTHLY':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'ALL_TIME':
      return null;
    default:
      return null;
  }
}

// Re-export types
export type { LeaderboardData, LeaderboardEntry };
