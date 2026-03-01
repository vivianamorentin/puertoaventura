/**
 * Monetization - Ads Module
 *
 * Advertising system for promoted places
 */

import type { PrismaClient } from '@pa/database';
import type {
  PlaceAdData,
  CreateAdInput,
  UpdateAdInput,
  AdMetrics,
} from '../types';
import { MonetizationError } from '../types';

/**
 * Creates a new place advertisement
 *
 * @param input - Ad creation data
 * @param prisma - Prisma client instance
 * @returns Created ad
 */
export async function createAd(
  input: CreateAdInput,
  prisma: PrismaClient
): Promise<PlaceAdData> {
  const ad = await prisma.placeAd.create({
    data: {
      placeId: input.placeId,
      membershipId: input.membershipId ?? null,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl ?? null,
      linkUrl: input.linkUrl ?? null,
      adType: input.adType,
      priority: input.priority ?? 0,
      dailyBudget: input.dailyBudget ?? null,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      status: 'PENDING_APPROVAL',
    },
  });

  return ad as PlaceAdData;
}

/**
 * Gets an ad by ID
 *
 * @param adId - Ad ID
 * @param prisma - Prisma client instance
 * @returns Ad data or null
 */
export async function getAd(
  adId: string,
  prisma: PrismaClient
): Promise<PlaceAdData | null> {
  const ad = await prisma.placeAd.findUnique({
    where: { id: adId },
    include: { place: true },
  });

  return ad as PlaceAdData | null;
}

/**
 * Updates an ad
 *
 * @param adId - Ad ID
 * @param updates - Updates to apply
 * @param prisma - Prisma client instance
 * @returns Updated ad
 */
export async function updateAd(
  adId: string,
  updates: UpdateAdInput,
  prisma: PrismaClient
): Promise<PlaceAdData> {
  const ad = await prisma.placeAd.update({
    where: { id: adId },
    data: updates,
  });

  return ad as PlaceAdData;
}

/**
 * Pauses an active ad
 *
 * @param adId - Ad ID
 * @param prisma - Prisma client instance
 */
export async function pauseAd(adId: string, prisma: PrismaClient): Promise<void> {
  await prisma.placeAd.update({
    where: { id: adId },
    data: { status: 'PAUSED' },
  });
}

/**
 * Activates a paused ad
 *
 * @param adId - Ad ID
 * @param prisma - Prisma client instance
 */
export async function activateAd(adId: string, prisma: PrismaClient): Promise<void> {
  await prisma.placeAd.update({
    where: { id: adId },
    data: { status: 'ACTIVE' },
  });
}

/**
 * Tracks an ad impression
 *
 * @param adId - Ad ID
 * @param prisma - Prisma client instance
 */
export async function trackImpression(
  adId: string,
  prisma: PrismaClient
): Promise<void> {
  await prisma.placeAd.update({
    where: { id: adId },
    data: { impressions: { increment: 1 } },
  });
}

/**
 * Tracks an ad click
 *
 * @param adId - Ad ID
 * @param prisma - Prisma client instance
 */
export async function trackClick(adId: string, prisma: PrismaClient): Promise<void> {
  await prisma.placeAd.update({
    where: { id: adId },
    data: { clicks: { increment: 1 } },
  });
}

/**
 * Tracks an ad conversion
 *
 * @param adId - Ad ID
 * @param prisma - Prisma client instance
 */
export async function trackConversion(
  adId: string,
  prisma: PrismaClient
): Promise<void> {
  await prisma.placeAd.update({
    where: { id: adId },
    data: { conversions: { increment: 1 } },
  });
}

/**
 * Gets active ads for a place
 *
 * @param placeId - Place ID
 * @param prisma - Prisma client instance
 * @returns Array of active ads
 */
export async function getActiveAdsForPlace(
  placeId: string,
  prisma: PrismaClient
): Promise<PlaceAdData[]> {
  const ads = await prisma.placeAd.findMany({
    where: {
      placeId,
      status: 'ACTIVE',
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  return ads as PlaceAdData[];
}

/**
 * Gets ads for a specific location on the app
 *
 * @param location - Location where ad will be shown
 * @param limit - Maximum number of ads to return
 * @param prisma - Prisma client instance
 * @returns Array of ads sorted by priority
 */
export async function getAdsForLocation(
  location: 'SEARCH_RESULTS' | 'MAP_VIEW' | 'PLACE_DETAIL',
  limit: number = 5,
  prisma: PrismaClient
): Promise<PlaceAdData[]> {
  const adTypeMapping: Record<string, string[]> = {
    SEARCH_RESULTS: ['SPONSORED_LISTING'],
    MAP_VIEW: ['FEATURED_PLACE', 'PROMOTED_PIN'],
    PLACE_DETAIL: ['BANNER_AD'],
  };

  const adTypes = adTypeMapping[location] ?? [];

  const ads = await prisma.placeAd.findMany({
    where: {
      adType: { in: adTypes as any },
      status: 'ACTIVE',
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
    include: { place: true },
    orderBy: [{ priority: 'desc' }, { impressions: 'asc' }],
    take: limit,
  });

  return ads as unknown as PlaceAdData[];
}

/**
 * Gets metrics for an ad
 *
 * @param adId - Ad ID
 * @param prisma - Prisma client instance
 * @returns Ad metrics
 */
export async function getAdMetrics(
  adId: string,
  prisma: PrismaClient
): Promise<AdMetrics> {
  const ad = await prisma.placeAd.findUnique({
    where: { id: adId },
  });

  if (!ad) {
    throw new MonetizationError('Ad not found', 'AD_NOT_FOUND');
  }

  const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
  const cpa = ad.conversions > 0 ? ad.clicks / ad.conversions : 0;
  const spend = ad.clicks * 0.5; // Assuming $0.50 CPC

  return {
    impressions: ad.impressions,
    clicks: ad.clicks,
    conversions: ad.conversions,
    ctr,
    cpa,
    spend,
  };
}

// Re-export types
export type { PlaceAdData, CreateAdInput, UpdateAdInput, AdMetrics };
