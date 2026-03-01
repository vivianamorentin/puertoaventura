/**
 * Reviews Module
 *
 * Review management and aggregation
 */

import type { PrismaClient } from '@pa/database';
import type {
  CreateReviewInput,
  UpdateReviewInput,
  ReviewWithDetails,
} from './types';
import { DiscoveryError } from './types';

/**
 * Creates a new review
 *
 * @param input - Review creation data
 * @param prisma - Prisma client instance
 * @returns Created review
 */
export async function createReview(
  input: CreateReviewInput,
  prisma: PrismaClient
): Promise<ReviewWithDetails> {
  // Validate rating range
  if (input.rating < 1 || input.rating > 5) {
    throw new DiscoveryError('Rating must be between 1 and 5', 'INVALID_RATING');
  }

  // Check if place exists
  const place = await prisma.place.findUnique({
    where: { id: input.placeId },
  });

  if (!place) {
    throw new DiscoveryError('Place not found', 'PLACE_NOT_FOUND');
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      placeId: input.placeId,
      userId: input.userId,
      rating: input.rating,
      title: input.title ?? null,
      content: input.content,
      images: input.images ?? null,
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
        },
      },
    },
  });

  // Update place aggregates
  await updatePlaceAggregates(input.placeId, prisma);

  return review as ReviewWithDetails;
}

/**
 * Gets a review by ID
 *
 * @param reviewId - Review ID
 * @param prisma - Prisma client instance
 * @returns Review or null
 */
export async function getReview(
  reviewId: string,
  prisma: PrismaClient
): Promise<ReviewWithDetails | null> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
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
        },
      },
    },
  });

  return review as ReviewWithDetails | null;
}

/**
 * Updates an existing review
 *
 * @param reviewId - Review ID
 * @param userId - User ID (for authorization)
 * @param updates - Updates to apply
 * @param prisma - Prisma client instance
 * @returns Updated review
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  updates: UpdateReviewInput,
  prisma: PrismaClient
): Promise<ReviewWithDetails> {
  // Validate rating range if provided
  if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
    throw new DiscoveryError('Rating must be between 1 and 5', 'INVALID_RATING');
  }

  // Check if review exists and belongs to user
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new DiscoveryError('Review not found', 'REVIEW_NOT_FOUND');
  }

  if (existingReview.userId !== userId) {
    throw new DiscoveryError('Not authorized to update this review', 'NOT_AUTHORIZED');
  }

  // Update review
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: updates,
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
        },
      },
    },
  });

  // Update place aggregates
  await updatePlaceAggregates(existingReview.placeId, prisma);

  return review as ReviewWithDetails;
}

/**
 * Deletes a review
 *
 * @param reviewId - Review ID
 * @param userId - User ID (for authorization)
 * @param prisma - Prisma client instance
 */
export async function deleteReview(
  reviewId: string,
  userId: string,
  prisma: PrismaClient
): Promise<void> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new DiscoveryError('Review not found', 'REVIEW_NOT_FOUND');
  }

  if (review.userId !== userId) {
    throw new DiscoveryError('Not authorized to delete this review', 'NOT_AUTHORIZED');
  }

  const placeId = review.placeId;

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update place aggregates
  await updatePlaceAggregates(placeId, prisma);
}

/**
 * Gets reviews for a place
 *
 * @param placeId - Place ID
 * @param options - Query options
 * @param prisma - Prisma client instance
 * @returns Array of reviews
 */
export async function getPlaceReviews(
  placeId: string,
  options: {
    limit?: number;
    offset?: number;
    minRating?: number;
    sortBy?: 'recent' | 'helpful' | 'rating';
  } = {},
  prisma: PrismaClient
): Promise<ReviewWithDetails[]> {
  const where: any = { placeId };

  if (options.minRating !== undefined) {
    where.rating = { gte: options.minRating };
  }

  const orderBy: any = {};
  switch (options.sortBy) {
    case 'helpful':
      orderBy.helpful = 'desc';
      break;
    case 'rating':
      orderBy.rating = 'desc';
      break;
    case 'recent':
    default:
      orderBy.createdAt = 'desc';
      break;
  }

  const reviews = await prisma.review.findMany({
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
        },
      },
    },
    orderBy,
    take: options.limit ?? 20,
    skip: options.offset ?? 0,
  });

  return reviews as ReviewWithDetails[];
}

/**
 * Gets reviews by a user
 *
 * @param userId - User ID
 * @param options - Query options
 * @param prisma - Prisma client instance
 * @returns Array of reviews
 */
export async function getUserReviews(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {},
  prisma: PrismaClient
): Promise<ReviewWithDetails[]> {
  const reviews = await prisma.review.findMany({
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 20,
    skip: options.offset ?? 0,
  });

  return reviews as ReviewWithDetails[];
}

/**
 * Marks a review as helpful
 *
 * @param reviewId - Review ID
 * @param prisma - Prisma client instance
 */
export async function markReviewHelpful(
  reviewId: string,
  prisma: PrismaClient
): Promise<void> {
  await prisma.review.update({
    where: { id: reviewId },
    data: { helpful: { increment: 1 } },
  });
}

/**
 * Flags a review for moderation
 *
 * @param reviewId - Review ID
 * @param prisma - Prisma client instance
 */
export async function flagReview(
  reviewId: string,
  prisma: PrismaClient
): Promise<void> {
  await prisma.review.update({
    where: { id: reviewId },
    data: { flagged: true },
  });
}

/**
 * Updates place aggregate data (total reviews, average rating)
 *
 * @param placeId - Place ID
 * @param prisma - Prisma client instance
 */
async function updatePlaceAggregates(
  placeId: string,
  prisma: PrismaClient
): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { placeId },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : null;

  await prisma.place.update({
    where: { id: placeId },
    data: {
      totalReviews,
      averageRating,
    },
  });
}

// Re-export types
export type { CreateReviewInput, UpdateReviewInput, ReviewWithDetails };
