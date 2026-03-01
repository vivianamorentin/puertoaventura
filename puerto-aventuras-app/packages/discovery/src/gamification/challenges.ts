/**
 * Gamification - Challenges Module
 *
 * Community challenges and competitions
 */

import type { PrismaClient } from '@pa/database';
import type { ChallengeData, ChallengeProgress, CreateChallengeInput } from '../types';
import { GamificationError } from '../types';

/**
 * Creates a new challenge
 *
 * @param input - Challenge creation data
 * @param prisma - Prisma client instance
 * @returns Created challenge
 */
export async function createChallenge(
  input: CreateChallengeInput,
  prisma: PrismaClient
): Promise<ChallengeData> {
  const challenge = await prisma.challenge.create({
    data: {
      name: input.name,
      description: input.description,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      pointsReward: input.pointsReward,
      badgeReward: input.badgeReward ?? null,
      maxParticipants: input.maxParticipants ?? null,
    },
  });

  // Link places if provided
  if (input.placeIds && input.placeIds.length > 0) {
    await prisma.placeChallenge.createMany({
      data: input.placeIds.map((placeId, index) => ({
        placeId,
        challengeId: challenge.id,
        order: index,
      })),
    });
  }

  return getChallenge(challenge.id, prisma) as Promise<ChallengeData>;
}

/**
 * Gets a challenge by ID
 *
 * @param challengeId - Challenge ID
 * @param prisma - Prisma client instance
 * @returns Challenge data or null
 */
export async function getChallenge(
  challengeId: string,
  prisma: PrismaClient
): Promise<ChallengeData | null> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      places: {
        include: { place: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!challenge) {
    return null;
  }

  return challenge as ChallengeData;
}

/**
 * Gets active challenges
 *
 * @param prisma - Prisma client instance
 * @returns Array of active challenges
 */
export async function getActiveChallenges(
  prisma: PrismaClient
): Promise<ChallengeData[]> {
  const challenges = await prisma.challenge.findMany({
    where: {
      active: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    include: {
      places: {
        include: { place: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  return challenges as ChallengeData[];
}

/**
 * Gets a user's progress on a challenge
 *
 * @param userId - User ID
 * @param challengeId - Challenge ID
 * @param prisma - Prisma client instance
 * @returns Challenge progress
 */
export async function getChallengeProgress(
  userId: string,
  challengeId: string,
  prisma: PrismaClient
): Promise<ChallengeProgress> {
  const challenge = await getChallenge(challengeId, prisma);

  if (!challenge) {
    throw new GamificationError('Challenge not found', 'CHALLENGE_NOT_FOUND');
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

  // Get or create completed challenge record
  const completedChallenge = await prisma.completedChallenge.upsert({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
    create: {
      userId,
      challengeId,
      gamificationId: gamification.id,
      progress: 0,
      completed: false,
    },
    update: {},
  });

  return {
    challengeId,
    userId,
    progress: completedChallenge.progress,
    completed: completedChallenge.completed,
    completedAt: completedChallenge.completedAt,
    challenge,
  };
}

/**
 * Tracks challenge progress after a check-in
 *
 * @param userId - User ID
 * @param placeId - Place ID where user checked in
 * @param prisma - Prisma client instance
 */
export async function trackChallengeProgress(
  userId: string,
  placeId: string,
  prisma: PrismaClient
): Promise<void> {
  // Find active challenges that include this place
  const placeChallenges = await prisma.placeChallenge.findMany({
    where: { placeId },
    include: {
      challenge: true,
    },
  });

  for (const pc of placeChallenges) {
    // Filter for active challenges
    if (!pc.challenge) continue;
    const now = new Date();
    if (
      !pc.challenge.active ||
      pc.challenge.startDate > now ||
      pc.challenge.endDate < now
    ) {
      continue;
    }

    // Get or create completed challenge record
    const completedChallenge = await prisma.completedChallenge.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId: pc.challenge.id,
        },
      },
      create: {
        userId,
        challengeId: pc.challenge.id,
        gamificationId: (
          await prisma.userGamification.upsert({
            where: { userId },
            create: { userId },
            update: {},
          })
        ).id,
        progress: 0,
        completed: false,
      },
      update: {},
    });

    if (!completedChallenge.completed) {
      const newProgress = completedChallenge.progress + 1;
      const totalRequired = await getChallengeRequirement(pc.challenge.id, prisma);
      const completed = newProgress >= totalRequired;

      await prisma.completedChallenge.update({
        where: { id: completedChallenge.id },
        data: {
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });

      // Award completion points
      if (completed && !completedChallenge.completed) {
        const { addPoints } = await import('./points');
        await addPoints(userId, pc.challenge.pointsReward, prisma);
      }
    }
  }
}

/**
 * Gets the requirement value for a challenge
 */
async function getChallengeRequirement(
  challengeId: string,
  prisma: PrismaClient
): Promise<number> {
  const placeCount = await prisma.placeChallenge.count({
    where: { challengeId },
  });

  return placeCount;
}

// Re-export types
export type { ChallengeData, ChallengeProgress, CreateChallengeInput };
