/**
 * Monetization - Memberships Module
 *
 * Business membership management
 */

import type { PrismaClient } from '@pa/database';
import type {
  BusinessMembershipData,
  CreateMembershipInput,
  MembershipLimits,
} from '../types';
import { MonetizationError } from '../types';

/**
 * Creates a new business membership
 *
 * @param input - Membership creation data
 * @param prisma - Prisma client instance
 * @returns Created membership
 */
export async function createMembership(
  input: CreateMembershipInput,
  prisma: PrismaClient
): Promise<BusinessMembershipData> {
  const membership = await prisma.businessMembership.create({
    data: {
      businessName: input.businessName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      tier: input.tier,
      billingCycle: input.billingCycle,
      price: input.price,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
    },
  });

  return membership as BusinessMembershipData;
}

/**
 * Gets a membership by ID
 *
 * @param membershipId - Membership ID
 * @param prisma - Prisma client instance
 * @returns Membership data or null
 */
export async function getMembership(
  membershipId: string,
  prisma: PrismaClient
): Promise<BusinessMembershipData | null> {
  const membership = await prisma.businessMembership.findUnique({
    where: { id: membershipId },
    include: {
      places: true,
      ads: true,
    },
  });

  return membership as BusinessMembershipData | null;
}

/**
 * Updates a membership
 *
 * @param membershipId - Membership ID
 * @param updates - Updates to apply
 * @param prisma - Prisma client instance
 * @returns Updated membership
 */
export async function updateMembership(
  membershipId: string,
  updates: Partial<CreateMembershipInput>,
  prisma: PrismaClient
): Promise<BusinessMembershipData> {
  const membership = await prisma.businessMembership.update({
    where: { id: membershipId },
    data: updates,
  });

  return membership as BusinessMembershipData;
}

/**
 * Cancels a membership
 *
 * @param membershipId - Membership ID
 * @param prisma - Prisma client instance
 */
export async function cancelMembership(
  membershipId: string,
  prisma: PrismaClient
): Promise<void> {
  await prisma.businessMembership.update({
    where: { id: membershipId },
    data: {
      status: 'CANCELLED',
      endDate: new Date(),
    },
  });
}

/**
 * Gets membership limits based on tier
 *
 * @param tier - Membership tier
 * @returns Membership limits
 */
export function getMembershipLimits(tier: string): MembershipLimits {
  const limits: Record<string, MembershipLimits> = {
    BASIC: {
      promotedPlaces: 1,
      adsAllowed: 0,
      analyticsAccess: false,
    },
    PROFESSIONAL: {
      promotedPlaces: 5,
      adsAllowed: 2,
      analyticsAccess: false,
    },
    PREMIUM: {
      promotedPlaces: 15,
      adsAllowed: 10,
      analyticsAccess: true,
    },
    ENTERPRISE: {
      promotedPlaces: -1, // Unlimited
      adsAllowed: -1, // Unlimited
      analyticsAccess: true,
    },
  };

  const result = (limits as Record<string, MembershipLimits>)[tier];
  return result ?? limits['BASIC'] as MembershipLimits;
}

/**
 * Checks if a membership can promote more places
 *
 * @param membershipId - Membership ID
 * @param prisma - Prisma client instance
 * @returns True if can promote more places
 */
export async function canPromoteMorePlaces(
  membershipId: string,
  prisma: PrismaClient
): Promise<boolean> {
  const membership = await prisma.businessMembership.findUnique({
    where: { id: membershipId },
  });

  if (!membership) {
    throw new MonetizationError('Membership not found', 'MEMBERSHIP_NOT_FOUND');
  }

  const limits = getMembershipLimits(membership.tier);

  if (limits.promotedPlaces < 0) {
    return true; // Unlimited
  }

  return membership.promotedPlacesCount < limits.promotedPlaces;
}

/**
 * Checks if a membership can create more ads
 *
 * @param membershipId - Membership ID
 * @param prisma - Prisma client instance
 * @returns True if can create more ads
 */
export async function canCreateMoreAds(
  membershipId: string,
  prisma: PrismaClient
): Promise<boolean> {
  const membership = await prisma.businessMembership.findUnique({
    where: { id: membershipId },
    include: {
      ads: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (!membership) {
    throw new MonetizationError('Membership not found', 'MEMBERSHIP_NOT_FOUND');
  }

  const limits = getMembershipLimits(membership.tier);

  if (limits.adsAllowed < 0) {
    return true; // Unlimited
  }

  return membership.ads.length < limits.adsAllowed;
}

// Re-export types
export type { BusinessMembershipData, CreateMembershipInput, MembershipLimits };
