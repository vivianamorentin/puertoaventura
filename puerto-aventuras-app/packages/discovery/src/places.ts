/**
 * Places Module
 *
 * CRUD operations for Place management in the Discovery module.
 * Following TDD methodology.
 */

import type {
  PrismaClient,
  Place,
  PlaceCategory,
} from '@pa/database';
import type {
  CreatePlaceInput,
  UpdatePlaceInput,
  PlaceFilters,
  SearchResults,
  PlaceWithDistance,
} from './types';
import { DiscoveryError } from './types';

/**
 * Valid latitude range: -90 to 90 degrees
 */
const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;

/**
 * Valid longitude range: -180 to 180 degrees
 */
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

/**
 * Creates a new place
 *
 * @param input - Place creation data
 * @param prisma - Prisma client instance
 * @returns The created place
 * @throws {DiscoveryError} If category not found or coordinates invalid
 */
export async function createPlace(
  input: CreatePlaceInput,
  prisma: PrismaClient
): Promise<Place & { category: PlaceCategory }> {
  // Validate latitude
  if (input.latitude < LATITUDE_MIN || input.latitude > LATITUDE_MAX) {
    throw new DiscoveryError(
      `Invalid latitude: ${input.latitude}. Must be between ${LATITUDE_MIN} and ${LATITUDE_MAX}`,
      'INVALID_LATITUDE'
    );
  }

  // Validate longitude
  if (input.longitude < LONGITUDE_MIN || input.longitude > LONGITUDE_MAX) {
    throw new DiscoveryError(
      `Invalid longitude: ${input.longitude}. Must be between ${LONGITUDE_MIN} and ${LONGITUDE_MAX}`,
      'INVALID_LONGITUDE'
    );
  }

  // Verify category exists
  const category = await prisma.placeCategory.findUnique({
    where: { id: input.categoryId },
  });

  if (!category) {
    throw new DiscoveryError('Category not found', 'CATEGORY_NOT_FOUND');
  }

  // Create place
  const place = await prisma.place.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      building: input.building ?? null,
      floor: input.floor ?? null,
      categoryId: input.categoryId,
      phone: input.phone ?? null,
      website: input.website ?? null,
      email: input.email ?? null,
      openingHours: input.openingHours ?? null,
      imageUrl: input.imageUrl ?? null,
      images: input.images ?? null,
      verified: input.verified ?? false,
    },
    include: {
      category: true,
    },
  });

  return place as Place & { category: PlaceCategory };
}

/**
 * Gets a place by ID
 *
 * @param id - Place ID
 * @param prisma - Prisma client instance
 * @returns The place or null if not found
 */
export async function getPlace(
  id: string,
  prisma: PrismaClient
): Promise<(Place & { category: PlaceCategory }) | null> {
  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  return place as (Place & { category: PlaceCategory }) | null;
}

/**
 * Updates an existing place
 *
 * @param id - Place ID
 * @param input - Place update data
 * @param prisma - Prisma client instance
 * @returns The updated place
 * @throws {DiscoveryError} If place not found or coordinates invalid
 */
export async function updatePlace(
  id: string,
  input: UpdatePlaceInput,
  prisma: PrismaClient
): Promise<Place & { category: PlaceCategory }> {
  // Check if place exists
  const existingPlace = await prisma.place.findUnique({
    where: { id },
  });

  if (!existingPlace) {
    throw new DiscoveryError('Place not found', 'PLACE_NOT_FOUND');
  }

  // Validate latitude if provided
  if (input.latitude !== undefined) {
    if (input.latitude < LATITUDE_MIN || input.latitude > LATITUDE_MAX) {
      throw new DiscoveryError(
        `Invalid latitude: ${input.latitude}. Must be between ${LATITUDE_MIN} and ${LATITUDE_MAX}`,
        'INVALID_LATITUDE'
      );
    }
  }

  // Validate longitude if provided
  if (input.longitude !== undefined) {
    if (input.longitude < LONGITUDE_MIN || input.longitude > LONGITUDE_MAX) {
      throw new DiscoveryError(
        `Invalid longitude: ${input.longitude}. Must be between ${LONGITUDE_MIN} and ${LONGITUDE_MAX}`,
        'INVALID_LONGITUDE'
      );
    }
  }

  // Update place
  const place = await prisma.place.update({
    where: { id },
    data: input,
    include: {
      category: true,
    },
  });

  return place as Place & { category: PlaceCategory };
}

/**
 * Deletes a place
 *
 * @param id - Place ID
 * @param prisma - Prisma client instance
 * @throws {DiscoveryError} If place not found
 */
export async function deletePlace(id: string, prisma: PrismaClient): Promise<void> {
  // Check if place exists
  const place = await prisma.place.findUnique({
    where: { id },
  });

  if (!place) {
    throw new DiscoveryError('Place not found', 'PLACE_NOT_FOUND');
  }

  // Delete place
  await prisma.place.delete({
    where: { id },
  });
}

/**
 * Lists places with optional filters
 *
 * @param filters - Optional filters
 * @param prisma - Prisma client instance
 * @returns Array of places
 */
export async function listPlaces(
  filters: PlaceFilters = {},
  prisma: PrismaClient
): Promise<(Place & { category: PlaceCategory })[]> {
  // Build where clause
  const where: any = {};

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  if (filters.verified !== undefined) {
    where.verified = filters.verified;
  }

  if (filters.promoted) {
    where.promotedUntil = {
      gt: new Date(),
    };
  }

  if (filters.minRating !== undefined) {
    where.averageRating = {
      gte: filters.minRating,
    };
  }

  // Build query options
  const options: any = {
    where,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  };

  // Add pagination
  if (filters.limit !== undefined) {
    options.take = filters.limit;
  }

  if (filters.offset !== undefined) {
    options.skip = filters.offset;
  }

  const places = await prisma.place.findMany(options);

  return places as (Place & { category: PlaceCategory })[];
}

/**
 * Searches places with text query and filters
 *
 * @param filters - Search filters including query
 * @param prisma - Prisma client instance
 * @returns Search results with pagination info
 */
export async function searchPlaces(
  filters: PlaceFilters & {
    limit?: number;
    offset?: number;
  } = {},
  prisma: PrismaClient
): Promise<SearchResults> {
  // Build where clause
  const andConditions: any[] = [];

  // Add text search if provided
  if (filters.searchQuery) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchQuery, mode: 'insensitive' } },
        { description: { contains: filters.searchQuery, mode: 'insensitive' } },
        { address: { contains: filters.searchQuery, mode: 'insensitive' } },
      ],
    });
  }

  // Add filters
  if (filters.categoryId) {
    andConditions.push({ categoryId: filters.categoryId });
  }

  if (filters.active !== undefined) {
    andConditions.push({ active: filters.active });
  }

  if (filters.verified !== undefined) {
    andConditions.push({ verified: filters.verified });
  }

  if (filters.promoted) {
    andConditions.push({
      promotedUntil: { gt: new Date() },
    });
  }

  if (filters.minRating !== undefined) {
    andConditions.push({
      averageRating: { gte: filters.minRating },
    });
  }

  // Build where clause
  const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

  // Build query options
  const options: any = {
    where,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  };

  // Add pagination
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  options.take = limit;
  options.skip = offset;

  // Execute query
  const places = await prisma.place.findMany(options);

  // Get total count for pagination
  const total = await prisma.place.count({ where });

  // Type assertion - the places array includes category from the query
  const placesWithDistance = places.map((p) => ({
    ...p,
    distance: undefined,
  })) as unknown as PlaceWithDistance[];

  return {
    places: placesWithDistance,
    total,
    limit,
    offset,
    hasMore: offset + places.length < total,
  };
}
