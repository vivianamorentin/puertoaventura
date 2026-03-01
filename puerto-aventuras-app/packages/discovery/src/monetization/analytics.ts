/**
 * Monetization - Analytics Module
 *
 * Business analytics and reporting
 */

import type { PrismaClient } from '@pa/database';
import type { PlaceAdData } from '../types';
import { MonetizationError } from '../types';

/**
 * Analytics data for a business
 */
export interface BusinessAnalytics {
  membershipId: string;
  totalPlaces: number;
  totalAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCtr: number;
  topPerformingAds: PlaceAdData[];
  monthlyTrend: Array<{
    month: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

/**
 * Gets analytics for a business membership
 *
 * @param membershipId - Membership ID
 * @param prisma - Prisma client instance
 * @returns Analytics data
 */
export async function getBusinessAnalytics(
  membershipId: string,
  prisma: PrismaClient
): Promise<BusinessAnalytics> {
  const membership = await prisma.businessMembership.findUnique({
    where: { id: membershipId },
    include: {
      places: true,
      ads: {
        where: {
          status: { in: ['ACTIVE', 'PAUSED', 'EXPIRED'] },
        },
      },
    },
  });

  if (!membership) {
    throw new MonetizationError('Membership not found', 'MEMBERSHIP_NOT_FOUND');
  }

  const totalImpressions = membership.ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = membership.ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalConversions = membership.ads.reduce((sum, ad) => sum + ad.conversions, 0);
  const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Top performing ads
  const topPerformingAds = membership.ads
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5) as PlaceAdData[];

  return {
    membershipId,
    totalPlaces: membership.places.length,
    totalAds: membership.ads.length,
    totalImpressions,
    totalClicks,
    totalConversions,
    averageCtr,
    topPerformingAds,
    monthlyTrend: await getMonthlyTrend(membershipId, prisma),
  };
}

/**
 * Gets monthly trend data for a membership
 *
 * @param membershipId - Membership ID
 * @param prisma - Prisma client instance
 * @returns Monthly trend data
 */
async function getMonthlyTrend(
  membershipId: string,
  prisma: PrismaClient
): Promise<Array<{ month: string; impressions: number; clicks: number; conversions: number }>> {
  // Get last 6 months of data
  const months: Array<{ month: string; impressions: number; clicks: number; conversions: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const ads = await prisma.placeAd.findMany({
      where: {
        membershipId,
        createdAt: { lte: monthEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: monthStart } },
        ],
      },
    });

    const impressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const clicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const conversions = ads.reduce((sum, ad) => sum + ad.conversions, 0);

    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      impressions,
      clicks,
      conversions,
    });
  }

  return months;
}

/**
 * Gets place performance data
 *
 * @param placeId - Place ID
 * @param prisma - Prisma client instance
 * @returns Place performance metrics
 */
export async function getPlacePerformance(
  placeId: string,
  prisma: PrismaClient
): Promise<{
  totalCheckIns: number;
  totalReviews: number;
  averageRating: number | null;
  adImpressions: number;
  adClicks: number;
}> {
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    include: {
      ads: true,
    },
  });

  if (!place) {
    throw new MonetizationError('Place not found', 'PLACE_NOT_FOUND');
  }

  const adImpressions = place.ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const adClicks = place.ads.reduce((sum, ad) => sum + ad.clicks, 0);

  return {
    totalCheckIns: place.totalCheckIns,
    totalReviews: place.totalReviews,
    averageRating: place.averageRating ? Number(place.averageRating) : null,
    adImpressions,
    adClicks,
  };
}
