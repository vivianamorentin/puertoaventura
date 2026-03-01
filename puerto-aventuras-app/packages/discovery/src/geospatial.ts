/**
 * Geospatial Module
 *
 * PostGIS-based geospatial queries for location-based searches
 */

import type { PrismaClient } from '@pa/database';
import type { PlaceFilters, PlaceWithDistance } from './types';

/**
 * Finds places within a specified radius of a point
 *
 * @param latitude - Center point latitude
 * @param longitude - Center point longitude
 * @param radiusMeters - Search radius in meters
 * @param filters - Additional filters
 * @param prisma - Prisma client instance
 * @returns Places with distance from center point
 */
export async function findNearbyPlaces(
  latitude: number,
  longitude: number,
  radiusMeters: number,
  filters: PlaceFilters = {},
  prisma: PrismaClient
): Promise<PlaceWithDistance[]> {
  // Note: This is a simplified implementation
  // For production, use PostGIS ST_DWithin and ST_Distance functions

  // Calculate bounding box for preliminary filter
  // 1 degree of latitude ≈ 111,000 meters
  // 1 degree of longitude ≈ 111,000 * cos(latitude) meters
  const latDelta = (radiusMeters / 111000) * 1.5; // Add some margin
  const lonDelta = (radiusMeters / (111000 * Math.cos((latitude * Math.PI) / 180))) * 1.5;

  // Build where clause
  const where: any = {
    latitude: {
      gte: latitude - latDelta,
      lte: latitude + latDelta,
    },
    longitude: {
      gte: longitude - lonDelta,
      lte: longitude + lonDelta,
    },
    active: true,
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const places = await prisma.place.findMany({
    where,
    include: { category: true },
  });

  // Calculate distances and filter by radius
  const placesWithDistance = places
    .map((place) => ({
      ...place,
      distance: calculateDistance(
        latitude,
        longitude,
        Number(place.latitude),
        Number(place.longitude)
      ),
    }))
    .filter((place) => place.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);

  return placesWithDistance as unknown as PlaceWithDistance[];
}

/**
 * Calculates the Haversine distance between two points
 *
 * @param lat1 - First point latitude
 * @param lon1 - First point longitude
 * @param lat2 - Second point latitude
 * @param lon2 - Second point longitude
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Finds places within a bounding box
 *
 * @param bounds - Bounding box coordinates
 * @param filters - Additional filters
 * @param prisma - Prisma client instance
 * @returns Places within the bounding box
 */
export async function findPlacesWithinBounds(
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  },
  filters: PlaceFilters = {},
  prisma: PrismaClient
): Promise<PlaceWithDistance[]> {
  const where: any = {
    latitude: {
      gte: bounds.south,
      lte: bounds.north,
    },
    longitude: {
      gte: bounds.west,
      lte: bounds.east,
    },
    active: true,
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const places = await prisma.place.findMany({
    where,
    include: { category: true },
  });

  return places as unknown as PlaceWithDistance[];
}
