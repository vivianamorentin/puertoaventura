/**
 * Categories Module - Tests
 *
 * TDD: RED phase - Write failing tests first
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  getCategoryTree,
} from './categories';
import { CreateCategoryInput, UpdateCategoryInput } from './types';

describe('categories', () => {
  const mockPrisma = {
    placeCategory: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    place: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategory = {
    id: 'cat-1',
    name: 'restaurant',
    displayName: 'Restaurant',
    description: 'Food and dining',
    icon: '🍽️',
    color: '#FF6B6B',
    parentId: null,
    displayOrder: 1,
    visible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockChildCategory = {
    id: 'cat-2',
    name: 'mexican-food',
    displayName: 'Mexican Food',
    description: 'Mexican cuisine',
    icon: '🌮',
    color: '#FF6B6B',
    parentId: 'cat-1',
    parent: mockCategory,
    displayOrder: 1,
    visible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    children: [],
    places: [],
  };

  describe('createCategory', () => {
    it('should create a new category', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'restaurant',
        displayName: 'Restaurant',
        description: 'Food and dining',
        icon: '🍽️',
        color: '#FF6B6B',
        displayOrder: 1,
        visible: true,
      };
      mockPrisma.placeCategory.create.mockResolvedValue(mockCategory);

      // Act
      const result = await createCategory(input, mockPrisma as any);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(mockPrisma.placeCategory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: input.name,
          displayName: input.displayName,
        }),
      });
    });

    it('should throw DiscoveryError when category name already exists', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'restaurant',
        displayName: 'Restaurant',
      };
      mockPrisma.placeCategory.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['name'] },
      });

      // Act & Assert
      await expect(createCategory(input, mockPrisma as any)).rejects.toThrow('Category with this name already exists');
    });
  });

  describe('getCategory', () => {
    it('should return category when found', async () => {
      // Arrange
      mockPrisma.placeCategory.findUnique.mockResolvedValue(mockCategory);

      // Act
      const result = await getCategory('cat-1', mockPrisma as any);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(mockPrisma.placeCategory.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });

    it('should return null when category not found', async () => {
      // Arrange
      mockPrisma.placeCategory.findUnique.mockResolvedValue(null);

      // Act
      const result = await getCategory('non-existent', mockPrisma as any);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateCategory', () => {
    it('should update category', async () => {
      // Arrange
      const input: UpdateCategoryInput = {
        displayName: 'Updated Restaurant',
        description: 'Updated description',
      };
      const updatedCategory = { ...mockCategory, displayName: input.displayName, description: input.description };
      mockPrisma.placeCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.placeCategory.update.mockResolvedValue(updatedCategory);

      // Act
      const result = await updateCategory('cat-1', input, mockPrisma as any);

      // Assert
      expect(result).toEqual(updatedCategory);
      expect(mockPrisma.placeCategory.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: input,
      });
    });

    it('should throw DiscoveryError when category to update not found', async () => {
      // Arrange
      const input: UpdateCategoryInput = { displayName: 'Updated' };
      mockPrisma.placeCategory.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(updateCategory('non-existent', input, mockPrisma as any)).rejects.toThrow('Category not found');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      // Arrange
      mockPrisma.placeCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.place.count.mockResolvedValue(0); // No places using this category
      mockPrisma.placeCategory.delete.mockResolvedValue(mockCategory);

      // Act
      await deleteCategory('cat-1', mockPrisma as any);

      // Assert
      expect(mockPrisma.placeCategory.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });

    it('should throw DiscoveryError when category to delete not found', async () => {
      // Arrange
      mockPrisma.placeCategory.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteCategory('non-existent', mockPrisma as any)).rejects.toThrow('Category not found');
    });

    it('should throw DiscoveryError when category has places', async () => {
      // Arrange
      mockPrisma.placeCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.place.count.mockResolvedValue(5); // 5 places using this category

      // Act & Assert
      await expect(deleteCategory('cat-1', mockPrisma as any)).rejects.toThrow('Cannot delete category with places');
    });
  });

  describe('listCategories', () => {
    it('should return list of categories', async () => {
      // Arrange
      const mockCategories = [mockCategory, mockChildCategory];
      mockPrisma.placeCategory.findMany.mockResolvedValue(mockCategories);

      // Act
      const result = await listCategories({}, mockPrisma as any);

      // Assert
      expect(result).toEqual(mockCategories);
      expect(mockPrisma.placeCategory.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should filter by visible status', async () => {
      // Arrange
      mockPrisma.placeCategory.findMany.mockResolvedValue([mockCategory]);

      // Act
      await listCategories({ visible: true }, mockPrisma as any);

      // Assert
      expect(mockPrisma.placeCategory.findMany).toHaveBeenCalledWith({
        where: { visible: true },
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should filter by parent category', async () => {
      // Arrange
      mockPrisma.placeCategory.findMany.mockResolvedValue([mockChildCategory]);

      // Act
      await listCategories({ parentId: 'cat-1' }, mockPrisma as any);

      // Assert
      expect(mockPrisma.placeCategory.findMany).toHaveBeenCalledWith({
        where: { parentId: 'cat-1' },
        orderBy: { displayOrder: 'asc' },
      });
    });
  });

  describe('getCategoryTree', () => {
    it('should return hierarchical tree structure', async () => {
      // Arrange
      const mockCategories = [
        mockCategory,
        mockChildCategory,
        {
          ...mockChildCategory,
          id: 'cat-3',
          name: 'italian-food',
          displayName: 'Italian Food',
        },
      ];
      mockPrisma.placeCategory.findMany.mockResolvedValue(mockCategories);

      // Act
      const result = await getCategoryTree(mockPrisma as any);

      // Assert
      expect(result).toHaveLength(1); // One root category
      expect(result[0]?.children).toHaveLength(2); // Two children
      expect(result[0]?.children[0]?.parentId).toBe('cat-1');
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      mockPrisma.placeCategory.findMany.mockResolvedValue([]);

      // Act
      const result = await getCategoryTree(mockPrisma as any);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
