/**
 * Search Module
 *
 * Advanced search functionality for places with multiple filters
 */

import type { PrismaClient } from '@pa/database';
import type { SearchOptions, SearchResults, PlaceWithDistance } from './types';

/**
 * Search places with multiple filters and sorting options
 *
 * @param options - Search options including query, filters, sort, pagination
 * @param prisma - Prisma client instance
 * @returns Search results with pagination
 */
export async function searchPlaces(
  options: SearchOptions = {},
  prisma: PrismaClient
): Promise<SearchResults> {
  // Build where clause
  const andConditions: any[] = [];

  // Add text search if provided
  if (options.query) {
    andConditions.push({
      OR: [
        { name: { contains: options.query, mode: 'insensitive' } },
        { description: { contains: options.query, mode: 'insensitive' } },
        { address: { contains: options.query, mode: 'insensitive' } },
      ],
    });
  }

  // Add filters
  if (options.categoryId) {
    andConditions.push({ categoryId: options.categoryId });
  }

  if (options.minRating !== undefined) {
    andConditions.push({ averageRating: { gte: options.minRating } });
  }

  if (options.verified !== undefined) {
    andConditions.push({ verified: options.verified });
  }

  if (options.promoted) {
    andConditions.push({ promotedUntil: { gt: new Date() } });
  }

  // Build where clause
  const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

  // Build query options
  const queryOptions: any = {
    where,
    include: { category: true },
    orderBy: buildOrderBy(options.sortBy, options.sortOrder),
    take: options.limit ?? 20,
    skip: options.offset ?? 0,
  };

  // Execute query
  const [places, total] = await Promise.all([
    prisma.place.findMany(queryOptions),
    prisma.place.count({ where }),
  ]);

  return {
    places: places.map((p) => ({
      ...p,
      distance: undefined,
    })) as unknown as PlaceWithDistance[],
    total,
    limit: options.limit ?? 20,
    offset: options.offset ?? 0,
    hasMore: (options.offset ?? 0) + places.length < total,
  };
}

/**
 * Builds order by clause based on sort options
 */
function buildOrderBy(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): any {
  const order = sortOrder ?? 'desc';

  switch (sortBy) {
    case 'rating':
      return { averageRating: order };
    case 'name':
      return { name: order };
    case 'checkIns':
      return { totalCheckIns: order };
    case 'reviews':
      return { totalReviews: order };
    case 'promoted':
      return [{ promotedUntil: 'desc' as const }, { featuredPriority: 'desc' as const }];
    case 'distance':
      // Distance requires geospatial query - handled in geospatial module
      return { createdAt: 'desc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}
