/**
 * Check-ins Module
 *
 * Location-based check-in system with GPS verification
 */

import type { PrismaClient } from '@pa/database';
import type {
  CreateCheckInInput,
  CheckInWithDetails,
  GPSVerificationResult,
} from './types';
import { DiscoveryError } from './types';
import { calculateDistance } from './geospatial';

/**
 * Default check-in verification radius in meters
 */
const DEFAULT_CHECK_IN_RADIUS = 50;

/**
 * Creates a new check-in with GPS verification
 *
 * @param input - Check-in creation data
 * @param prisma - Prisma client instance
 * @returns Created check-in
 */
export async function createCheckIn(
  input: CreateCheckInInput,
  prisma: PrismaClient
): Promise<CheckInWithDetails> {
  // Get place to verify coordinates
  const place = await prisma.place.findUnique({
    where: { id: input.placeId },
  });

  if (!place) {
    throw new DiscoveryError('Place not found', 'PLACE_NOT_FOUND');
  }

  // Verify location if coordinates provided
  let verified = true;
  let verifiedLatitude: number | null = null;
  let verifiedLongitude: number | null = null;
  let accuracy: number | null = null;

  if (input.verifiedLatitude !== undefined && input.verifiedLongitude !== undefined) {
    const verification = verifyUserLocation(
      input.verifiedLatitude,
      input.verifiedLongitude,
      Number(place.latitude),
      Number(place.longitude),
      DEFAULT_CHECK_IN_RADIUS
    );

    verified = verification.withinThreshold;
    verifiedLatitude = input.verifiedLatitude;
    verifiedLongitude = input.verifiedLongitude;
    accuracy = verification.distanceMeters;
  }

  // Calculate points earned
  const pointsEarned = verified ? 10 : 0;

  // Create check-in
  const checkIn = await prisma.checkIn.create({
    data: {
      placeId: input.placeId,
      userId: input.userId,
      verifiedLatitude,
      verifiedLongitude,
      accuracy,
      message: input.message ?? null,
      photos: input.photos ?? null,
      visibility: input.visibility ?? 'PUBLIC',
      pointsEarned,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      place: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  // Update place and user aggregates
  await Promise.all([
    updatePlaceCheckInAggregates(input.placeId, prisma),
    updateUserCheckInAggregates(input.userId, pointsEarned, prisma),
    trackChallengeProgress(input.userId, input.placeId, prisma),
  ]);

  return checkIn as CheckInWithDetails;
}

/**
 * Gets a check-in by ID
 *
 * @param checkInId - Check-in ID
 * @param prisma - Prisma client instance
 * @returns Check-in or null
 */
export async function getCheckIn(
  checkInId: string,
  prisma: PrismaClient
): Promise<CheckInWithDetails | null> {
  const checkIn = await prisma.checkIn.findUnique({
    where: { id: checkInId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      place: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  return checkIn as CheckInWithDetails | null;
}

/**
 * Gets check-ins for a place
 *
 * @param placeId - Place ID
 * @param options - Query options
 * @param prisma - Prisma client instance
 * @returns Array of check-ins
 */
export async function getPlaceCheckIns(
  placeId: string,
  options: {
    limit?: number;
    offset?: number;
    visibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  } = {},
  prisma: PrismaClient
): Promise<CheckInWithDetails[]> {
  const where: any = { placeId };

  if (options.visibility) {
    where.visibility = options.visibility;
  }

  const checkIns = await prisma.checkIn.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      place: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 20,
    skip: options.offset ?? 0,
  });

  return checkIns as CheckInWithDetails[];
}

/**
 * Gets check-ins by a user
 *
 * @param userId - User ID
 * @param options - Query options
 * @param prisma - Prisma client instance
 * @returns Array of check-ins
 */
export async function getUserCheckIns(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {},
  prisma: PrismaClient
): Promise<CheckInWithDetails[]> {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      place: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 20,
    skip: options.offset ?? 0,
  });

  return checkIns as CheckInWithDetails[];
}

/**
 * Gets feed of recent check-ins
 *
 * @param options - Query options
 * @param prisma - Prisma client instance
 * @returns Array of check-ins
 */
export async function getCheckInFeed(
  options: {
    limit?: number;
    offset?: number;
    userId?: string; // If provided, only show friends' check-ins
  } = {},
  prisma: PrismaClient
): Promise<CheckInWithDetails[]> {
  const where: any = {
    visibility: 'PUBLIC',
  };

  const checkIns = await prisma.checkIn.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      place: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 20,
    skip: options.offset ?? 0,
  });

  return checkIns as CheckInWithDetails[];
}

/**
 * Verifies user location against place location
 *
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @param placeLat - Place's latitude
 * @param placeLon - Place's longitude
 * @param radiusMeters - Verification radius in meters
 * @returns GPS verification result
 */
export function verifyUserLocation(
  userLat: number,
  userLon: number,
  placeLat: number,
  placeLon: number,
  radiusMeters: number = DEFAULT_CHECK_IN_RADIUS
): GPSVerificationResult {
  const distance = calculateDistance(userLat, userLon, placeLat, placeLon);

  return {
    verified: true,
    distanceMeters: distance,
    withinThreshold: distance <= radiusMeters,
  };
}

/**
 * Updates place check-in aggregates
 *
 * @param placeId - Place ID
 * @param prisma - Prisma client instance
 */
async function updatePlaceCheckInAggregates(
  placeId: string,
  prisma: PrismaClient
): Promise<void> {
  await prisma.place.update({
    where: { id: placeId },
    data: {
      totalCheckIns: { increment: 1 },
    },
  });
}

/**
 * Updates user check-in aggregates and streak
 *
 * @param userId - User ID
 * @param pointsEarned - Points earned from check-in
 * @param prisma - Prisma client instance
 */
async function updateUserCheckInAggregates(
  userId: string,
  pointsEarned: number,
  prisma: PrismaClient
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  let newStreak = 1;
  let longestStreak = gamification?.longestStreak ?? 0;

  if (gamification?.lastCheckInDate) {
    const lastCheckIn = new Date(gamification.lastCheckInDate);
    lastCheckIn.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, don't increment streak
      newStreak = gamification.currentStreak;
    } else if (daysDiff === 1) {
      // Next day, increment streak
      newStreak = gamification.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, newStreak);

  await prisma.userGamification.upsert({
    where: { userId },
    create: {
      userId,
      totalPoints: pointsEarned,
      totalCheckIns: 1,
      currentStreak: newStreak,
      longestStreak,
      lastCheckInDate: new Date(),
    },
    update: {
      totalPoints: { increment: pointsEarned },
      totalCheckIns: { increment: 1 },
      currentStreak: newStreak,
      longestStreak,
      lastCheckInDate: new Date(),
    },
  });
}

/**
 * Tracks challenge progress after check-in
 *
 * @param userId - User ID
 * @param placeId - Place ID
 * @param prisma - Prisma client instance
 */
async function trackChallengeProgress(
  userId: string,
  placeId: string,
  prisma: PrismaClient
): Promise<void> {
  // Import dynamically to avoid circular dependency
  const { trackChallengeProgress: trackChallenge } = await import('./gamification/challenges');
  await trackChallenge(userId, placeId, prisma);
}

// Re-export types
export type { CreateCheckInInput, CheckInWithDetails, GPSVerificationResult };
