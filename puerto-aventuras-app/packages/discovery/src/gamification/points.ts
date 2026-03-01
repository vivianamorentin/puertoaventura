/**
 * Gamification - Points Module
 *
 * Points calculation and level management
 */

import type { PrismaClient } from '@pa/database';
import type { LevelInfo, PointsCalculationResult } from '../types';
import { GamificationError } from '../types';

/**
 * Adds points to a user
 *
 * @param userId - User ID
 * @param points - Points to add
 * @param prisma - Prisma client instance
 * @returns Points calculation result
 */
export async function addPoints(
  userId: string,
  points: number,
  prisma: PrismaClient
): Promise<PointsCalculationResult> {
  if (points <= 0) {
    throw new GamificationError('Points must be positive', 'INVALID_POINTS');
  }

  const profile = await prisma.userGamification.upsert({
    where: { userId },
    create: {
      userId,
      totalPoints: points,
      currentLevel: 1,
      pointsToNext: 100,
    },
    update: {
      totalPoints: { increment: points },
    },
  });

  // Check for level up
  const newLevel = calculateLevelFromPoints(profile.totalPoints);
  const levelUp = newLevel > profile.currentLevel;

  if (levelUp) {
    await prisma.userGamification.update({
      where: { userId },
      data: {
        currentLevel: newLevel,
        pointsToNext: calculatePointsForLevel(newLevel + 1),
      },
    });
  }

  const result: PointsCalculationResult = {
    pointsEarned: points,
    totalPoints: profile.totalPoints,
    levelUp,
    badgesUnlocked: [], // Badge checking done separately
  };

  if (levelUp) {
    result.newLevel = newLevel;
  }

  return result;
}

/**
 * Calculates level from total points
 *
 * @param totalPoints - Total points
 * @returns Calculated level
 */
export function calculateLevelFromPoints(totalPoints: number): number {
  // Level formula: each level requires 100 * level points
  // Level 1: 0-99 points
  // Level 2: 100-299 points
  // Level 3: 300-599 points
  // etc.

  let level = 1;
  let pointsRequired = 0;

  while (pointsRequired + level * 100 <= totalPoints) {
    pointsRequired += level * 100;
    level++;
  }

  return level;
}

/**
 * Calculates points required for a given level
 *
 * @param level - Target level
 * @returns Points required
 */
export function calculatePointsForLevel(level: number): number {
  // Cumulative points required for each level
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * 100;
  }
  return total;
}

/**
 * Gets level information for a user
 *
 * @param userId - User ID
 * @param prisma - Prisma client instance
 * @returns Level information
 */
export async function getLevelInfo(
  userId: string,
  prisma: PrismaClient
): Promise<LevelInfo> {
  const profile = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!profile) {
    return {
      level: 1,
      title: 'Novato',
      currentPoints: 0,
      pointsToNext: 100,
      progress: 0,
    };
  }

  const levelInfo = getLevelTitle(profile.currentLevel);
  const pointsForCurrentLevel = calculatePointsForLevel(profile.currentLevel);
  const pointsForNextLevel = calculatePointsForLevel(profile.currentLevel + 1);
  const progressInRange = pointsForNextLevel - pointsForCurrentLevel;
  const currentProgress = profile.totalPoints - pointsForCurrentLevel;

  return {
    level: profile.currentLevel,
    title: levelInfo,
    currentPoints: profile.totalPoints,
    pointsToNext: profile.pointsToNext,
    progress: progressInRange > 0 ? (currentProgress / progressInRange) * 100 : 100,
  };
}

/**
 * Gets the title for a given level
 */
function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: 'Novato',
    2: 'Explorador',
    3: 'Conocedor',
    4: 'Experto',
    5: 'Maestro Local',
    6: 'Leyenda',
    7: 'Ícono de PA',
  };
  return titles[level] || 'Leyenda';
}

/**
 * Deducts points from a user (use with caution)
 *
 * @param userId - User ID
 * @param points - Points to deduct
 * @param prisma - Prisma client instance
 */
export async function deductPoints(
  userId: string,
  points: number,
  prisma: PrismaClient
): Promise<void> {
  if (points <= 0) {
    throw new GamificationError('Points must be positive', 'INVALID_POINTS');
  }

  const profile = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!profile || profile.totalPoints < points) {
    throw new GamificationError('Insufficient points', 'INSUFFICIENT_POINTS');
  }

  await prisma.userGamification.update({
    where: { userId },
    data: {
      totalPoints: { decrement: points },
    },
  });
}
