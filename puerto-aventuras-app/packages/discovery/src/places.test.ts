/**
 * Places Module - Tests
 *
 * TDD: RED phase - Write failing tests first
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createPlace,
  getPlace,
  updatePlace,
  deletePlace,
  listPlaces,
  searchPlaces,
} from './places';
import { CreatePlaceInput, UpdatePlaceInput } from './types';

describe('places', () => {
  // Mock Prisma client
  const mockPrisma = {
    place: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    placeCategory: {
      findUnique: jest.fn(),
    },
  };

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test data
  const mockCategory = {
    id: 'category-1',
    name: 'restaurant',
    displayName: 'Restaurant',
    description: 'Food and dining',
    icon: '🍽️',
    color: '#FF6B6B',
    parentId: null,
    displayOrder: 1,
    visible: true,
  };

  const mockPlace = {
    id: 'place-1',
    name: 'Puerto Cafe',
    description: 'Best coffee in Puerto Aventuras',
    latitude: 20.4875,
    longitude: -86.7725,
    address: 'Marina Village #5',
    building: 'Marina Village',
    floor: null,
    categoryId: 'category-1',
    category: mockCategory,
    phone: '+52-984-123-4567',
    website: 'https://puertocafe.com',
    email: 'info@puertocafe.com',
    openingHours: '{"monday": {"open": "07:00", "close": "21:00"}}',
    imageUrl: 'https://example.com/image.jpg',
    images: '[]',
    verified: false,
    active: true,
    promotedUntil: null,
    featuredPriority: 0,
    totalCheckIns: 0,
    totalReviews: 0,
    averageRating: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('createPlace', () => {
    it('should create a new place with valid input', async () => {
      // Arrange
      const input: CreatePlaceInput = {
        name: 'Puerto Cafe',
        description: 'Best coffee in Puerto Aventuras',
        latitude: 20.4875,
        longitude: -86.7725,
        address: 'Marina Village #5',
        building: 'Marina Village',
        categoryId: 'category-1',
        phone: '+52-984-123-4567',
        website: 'https://puertocafe.com',
        email: 'info@puertocafe.com',
        openingHours: '{"monday": {"open": "07:00", "close": "21:00"}}',
        imageUrl: 'https://example.com/image.jpg',
        verified: false,
      };

      mockPrisma.placeCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.place.create.mockResolvedValue(mockPlace);

      // Act
      const result = await createPlace(input, mockPrisma as any);

      // Assert
      expect(result).toEqual(mockPlace);
      expect(mockPrisma.placeCategory.findUnique).toHaveBeenCalledWith({
        where: { id: input.categoryId },
      });
      expect(mockPrisma.place.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: input.name,
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          categoryId: input.categoryId,
          building: input.building,
          floor: null,
          description: input.description,
          email: input.email,
          imageUrl: input.imageUrl,
          images: null,
          openingHours: input.openingHours,
          phone: input.phone,
          verified: false,
          website: input.website,
        }),
        include: { category: true },
      });
    });

    it('should throw DiscoveryError when category does not exist', async () => {
      // Arrange
      const input: CreatePlaceInput = {
        name: 'Test Place',
        latitude: 20.4875,
        longitude: -86.7725,
        address: 'Test Address',
        categoryId: 'non-existent',
      };

      mockPrisma.placeCategory.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(createPlace(input, mockPrisma as any)).rejects.toThrow('Category not found');
    });

    it('should throw DiscoveryError when latitude is out of range', async () => {
      // Arrange
      const input: CreatePlaceInput = {
        name: 'Invalid Place',
        latitude: 95, // Invalid: must be between -90 and 90
        longitude: -86.7725,
        address: 'Test Address',
        categoryId: 'category-1',
      };

      mockPrisma.placeCategory.findUnique.mockResolvedValue(mockCategory);

      // Act & Assert
      await expect(createPlace(input, mockPrisma as any)).rejects.toThrow('Invalid latitude');
    });

    it('should throw DiscoveryError when longitude is out of range', async () => {
      // Arrange
      const input: CreatePlaceInput = {
        name: 'Invalid Place',
        latitude: 20.4875,
        longitude: -185, // Invalid: must be between -180 and 180
        address: 'Test Address',
        categoryId: 'category-1',
      };

      mockPrisma.placeCategory.findUnique.mockResolvedValue(mockCategory);

      // Act & Assert
      await expect(createPlace(input, mockPrisma as any)).rejects.toThrow('Invalid longitude');
    });
  });

  describe('getPlace', () => {
    it('should return place when found', async () => {
      // Arrange
      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);

      // Act
      const result = await getPlace('place-1', mockPrisma as any);

      // Assert
      expect(result).toEqual(mockPlace);
      expect(mockPrisma.place.findUnique).toHaveBeenCalledWith({
        where: { id: 'place-1' },
        include: { category: true },
      });
    });

    it('should return null when place not found', async () => {
      // Arrange
      mockPrisma.place.findUnique.mockResolvedValue(null);

      // Act
      const result = await getPlace('non-existent', mockPrisma as any);

      // Assert
      expect(result).toBeNull();
    });

    it('should include category in result', async () => {
      // Arrange
      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);

      // Act
      await getPlace('place-1', mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findUnique).toHaveBeenCalledWith({
        where: { id: 'place-1' },
        include: { category: true },
      });
    });
  });

  describe('updatePlace', () => {
    it('should update place with valid input', async () => {
      // Arrange
      const input: UpdatePlaceInput = {
        name: 'Updated Puerto Cafe',
        description: 'Even better coffee',
      };

      const updatedPlace = { ...mockPlace, name: input.name, description: input.description };
      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);
      mockPrisma.place.update.mockResolvedValue(updatedPlace);

      // Act
      const result = await updatePlace('place-1', input, mockPrisma as any);

      // Assert
      expect(result).toEqual(updatedPlace);
      expect(mockPrisma.place.update).toHaveBeenCalledWith({
        where: { id: 'place-1' },
        data: {
          name: input.name,
          description: input.description,
        },
        include: { category: true },
      });
    });

    it('should throw DiscoveryError when place to update not found', async () => {
      // Arrange
      const input: UpdatePlaceInput = { name: 'Updated Name' };
      mockPrisma.place.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(updatePlace('non-existent', input, mockPrisma as any)).rejects.toThrow('Place not found');
    });

    it('should validate latitude range on update', async () => {
      // Arrange
      const input: UpdatePlaceInput = { latitude: 95 };
      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);

      // Act & Assert
      await expect(updatePlace('place-1', input, mockPrisma as any)).rejects.toThrow('Invalid latitude');
    });

    it('should validate longitude range on update', async () => {
      // Arrange
      const input: UpdatePlaceInput = { longitude: -185 };
      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);

      // Act & Assert
      await expect(updatePlace('place-1', input, mockPrisma as any)).rejects.toThrow('Invalid longitude');
    });
  });

  describe('deletePlace', () => {
    it('should delete place successfully', async () => {
      // Arrange
      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);
      mockPrisma.place.delete.mockResolvedValue(mockPlace);

      // Act
      await deletePlace('place-1', mockPrisma as any);

      // Assert
      expect(mockPrisma.place.delete).toHaveBeenCalledWith({
        where: { id: 'place-1' },
      });
    });

    it('should throw DiscoveryError when place to delete not found', async () => {
      // Arrange
      mockPrisma.place.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(deletePlace('non-existent', mockPrisma as any)).rejects.toThrow('Place not found');
    });
  });

  describe('listPlaces', () => {
    it('should return list of places', async () => {
      // Arrange
      const mockPlaces = [mockPlace, { ...mockPlace, id: 'place-2', name: 'Second Place' }];
      mockPrisma.place.findMany.mockResolvedValue(mockPlaces);

      // Act
      const result = await listPlaces({}, mockPrisma as any);

      // Assert
      expect(result).toEqual(mockPlaces);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by category', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);

      // Act
      await listPlaces({ categoryId: 'category-1' }, mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: { categoryId: 'category-1' },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by active status', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);

      // Act
      await listPlaces({ active: true }, mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: { active: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by verified status', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([]);

      // Act
      await listPlaces({ verified: true }, mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: { verified: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by promoted places', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);

      // Act
      await listPlaces({ promoted: true }, mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: {
          promotedUntil: { gt: expect.any(Date) },
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by minimum rating', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);

      // Act
      await listPlaces({ minRating: 4 }, mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: { averageRating: { gte: 4 } },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should support pagination with limit and offset', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);

      // Act
      await listPlaces({ limit: 10, offset: 20 }, mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20,
      });
    });
  });

  describe('searchPlaces', () => {
    it('should search places by name', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);
      mockPrisma.place.count.mockResolvedValue(1);

      // Act
      const result = await searchPlaces({ searchQuery: 'cafe' }, mockPrisma as any);

      // Assert
      expect(result.places).toEqual([mockPlace]);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: 'cafe', mode: 'insensitive' } },
                { description: { contains: 'cafe', mode: 'insensitive' } },
                { address: { contains: 'cafe', mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
      expect(result.total).toBe(1);
    });

    it('should return empty array when no results found', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([]);
      mockPrisma.place.count.mockResolvedValue(0);

      // Act
      const result = await searchPlaces({ searchQuery: 'nonexistent' }, mockPrisma as any);

      // Assert
      expect(result.places).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should combine search with filters', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);
      mockPrisma.place.count.mockResolvedValue(1);

      // Act
      await searchPlaces(
        {
          searchQuery: 'cafe',
          categoryId: 'category-1',
          active: true,
        },
        mockPrisma as any
      );

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: 'cafe', mode: 'insensitive' } },
                { description: { contains: 'cafe', mode: 'insensitive' } },
                { address: { contains: 'cafe', mode: 'insensitive' } },
              ],
            },
            { categoryId: 'category-1' },
            { active: true },
          ],
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should respect limit parameter', async () => {
      // Arrange
      mockPrisma.place.findMany.mockResolvedValue([mockPlace]);
      mockPrisma.place.count.mockResolvedValue(1);

      // Act
      await searchPlaces({ limit: 5 }, mockPrisma as any);

      // Assert
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        skip: 0,
      });
    });
  });
});
