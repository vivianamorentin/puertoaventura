/**
 * Gamification - Badges Module
 *
 * Badge management and awarding logic
 */

import type { PrismaClient } from '@pa/database';
import type { BadgeData, BadgeEligibilityResult } from '../types';
import { GamificationError } from '../types';

/**
 * Awards a badge to a user
 *
 * @param userId - User ID
 * @param badgeId - Badge ID
 * @param prisma - Prisma client instance
 * @returns The awarded user badge
 */
export async function awardBadge(
  userId: string,
  badgeId: string,
  prisma: PrismaClient
) {
  // Check if badge exists
  const badge = await prisma.badge.findUnique({
    where: { id: badgeId },
  });

  if (!badge) {
    throw new GamificationError('Badge not found', 'BADGE_NOT_FOUND');
  }

  // Check if user already has this badge
  const existingBadge = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId,
      },
    },
  });

  if (existingBadge?.unlocked) {
    throw new GamificationError('User already has this badge', 'BADGE_ALREADY_UNLOCKED');
  }

  // Get or create user gamification profile
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) {
    gamification = await prisma.userGamification.create({
      data: { userId },
    });
  }

  // Create or update user badge
  const userBadge = await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId,
        badgeId,
      },
    },
    create: {
      userId,
      badgeId,
      gamificationId: gamification.id,
      progress: badge.requirementValue,
      unlocked: true,
      unlockedAt: new Date(),
    },
    update: {
      progress: badge.requirementValue,
      unlocked: true,
      unlockedAt: new Date(),
    },
  });

  // Add points reward
  if (badge.pointsReward > 0) {
    await addPoints(userId, badge.pointsReward, prisma);
  }

  return userBadge;
}

/**
 * Checks badge eligibility for a user
 *
 * @param userId - User ID
 * @param badgeId - Badge ID
 * @param prisma - Prisma client instance
 * @returns Badge eligibility result
 */
export async function checkBadgeEligibility(
  userId: string,
  badgeId: string,
  prisma: PrismaClient
): Promise<BadgeEligibilityResult> {
  const badge = await prisma.badge.findUnique({
    where: { id: badgeId },
  });

  if (!badge) {
    throw new GamificationError('Badge not found', 'BADGE_NOT_FOUND');
  }

  const stats = await getUserStats(userId, prisma);
  const currentProgress = getCurrentProgress(stats, badge.requirementType);
  const required = badge.requirementValue;
  const eligible = currentProgress >= required;

  return {
    eligible,
    currentProgress,
    requiredValue: required,
    remaining: Math.max(0, required - currentProgress),
  };
}

/**
 * Gets user statistics for badge checking
 */
async function getUserStats(userId: string, prisma: PrismaClient) {
  const gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  return {
    totalCheckIns: gamification?.totalCheckIns ?? 0,
    totalReviews: gamification?.totalReviews ?? 0,
    placesDiscovered: gamification?.placesDiscovered ?? 0,
    currentStreak: gamification?.currentStreak ?? 0,
  };
}

/**
 * Gets current progress value based on requirement type
 */
function getCurrentProgress(
  stats: ReturnType<typeof getUserStats> extends Promise<infer T> ? T : never,
  requirementType: string
): number {
  switch (requirementType) {
    case 'FIRST_CHECK_IN':
    case 'CHECK_INS_10':
    case 'CHECK_INS_50':
    case 'CHECK_INS_100':
      return stats.totalCheckIns;
    case 'REVIEWS_5':
    case 'REVIEWS_20':
      return stats.totalReviews;
    case 'STREAK_7':
    case 'STREAK_30':
      return stats.currentStreak;
    case 'PLACES_DISCOVERED_20':
      return stats.placesDiscovered;
    default:
      return 0;
  }
}

/**
 * Adds points to a user's gamification profile
 */
async function addPoints(userId: string, points: number, prisma: PrismaClient) {
  await prisma.userGamification.upsert({
    where: { userId },
    create: {
      userId,
      totalPoints: points,
    },
    update: {
      totalPoints: { increment: points },
    },
  });
}

// Re-export types
export type { BadgeData };
