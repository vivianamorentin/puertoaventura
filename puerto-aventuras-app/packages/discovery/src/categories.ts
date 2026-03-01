/**
 * Categories Module
 *
 * CRUD operations for Place Category management.
 * Following TDD methodology.
 */

import type {
  PrismaClient,
  PlaceCategory,
} from '@pa/database';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryTreeNode,
} from './types';
import { DiscoveryError } from './types';

/**
 * Creates a new place category
 *
 * @param input - Category creation data
 * @param prisma - Prisma client instance
 * @returns The created category
 * @throws {DiscoveryError} If category name already exists
 */
export async function createCategory(
  input: CreateCategoryInput,
  prisma: PrismaClient
): Promise<PlaceCategory> {
  try {
    const category = await prisma.placeCategory.create({
      data: {
        name: input.name,
        displayName: input.displayName,
        description: input.description ?? null,
        icon: input.icon ?? null,
        color: input.color ?? null,
        parentId: input.parentId ?? null,
        displayOrder: input.displayOrder ?? 0,
        visible: input.visible ?? true,
      },
    });

    return category;
  } catch (error: any) {
    // Handle unique constraint violation on name
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      throw new DiscoveryError('Category with this name already exists', 'CATEGORY_EXISTS');
    }
    throw error;
  }
}

/**
 * Gets a category by ID
 *
 * @param id - Category ID
 * @param prisma - Prisma client instance
 * @returns The category or null if not found
 */
export async function getCategory(
  id: string,
  prisma: PrismaClient
): Promise<PlaceCategory | null> {
  const category = await prisma.placeCategory.findUnique({
    where: { id },
  });

  return category;
}

/**
 * Updates an existing category
 *
 * @param id - Category ID
 * @param input - Category update data
 * @param prisma - Prisma client instance
 * @returns The updated category
 * @throws {DiscoveryError} If category not found
 */
export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
  prisma: PrismaClient
): Promise<PlaceCategory> {
  // Check if category exists
  const existingCategory = await prisma.placeCategory.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new DiscoveryError('Category not found', 'CATEGORY_NOT_FOUND');
  }

  // Update category
  const category = await prisma.placeCategory.update({
    where: { id },
    data: input,
  });

  return category;
}

/**
 * Deletes a category
 *
 * @param id - Category ID
 * @param prisma - Prisma client instance
 * @throws {DiscoveryError} If category not found or has places
 */
export async function deleteCategory(id: string, prisma: PrismaClient): Promise<void> {
  // Check if category exists
  const category = await prisma.placeCategory.findUnique({
    where: { id },
  });

  if (!category) {
    throw new DiscoveryError('Category not found', 'CATEGORY_NOT_FOUND');
  }

  // Check if category has places
  const placesCount = await prisma.place.count({
    where: { categoryId: id },
  });

  if (placesCount > 0) {
    throw new DiscoveryError(
      'Cannot delete category with places',
      'CATEGORY_HAS_PLACES'
    );
  }

  // Delete category
  await prisma.placeCategory.delete({
    where: { id },
  });
}

/**
 * Lists categories with optional filters
 *
 * @param filters - Optional filters
 * @param prisma - Prisma client instance
 * @returns Array of categories
 */
export async function listCategories(
  filters: {
    visible?: boolean;
    parentId?: string | null;
  } = {},
  prisma: PrismaClient
): Promise<PlaceCategory[]> {
  // Build where clause
  const where: any = {};

  if (filters.visible !== undefined) {
    where.visible = filters.visible;
  }

  if (filters.parentId !== undefined) {
    where.parentId = filters.parentId;
  }

  const categories = await prisma.placeCategory.findMany({
    where,
    orderBy: { displayOrder: 'asc' },
  });

  return categories;
}

/**
 * Gets category tree with hierarchical structure
 *
 * @param prisma - Prisma client instance
 * @returns Hierarchical tree of categories
 */
export async function getCategoryTree(
  prisma: PrismaClient
): Promise<CategoryTreeNode[]> {
  const categories = await prisma.placeCategory.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  // Build a map for quick lookup
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // Initialize all categories as tree nodes
  categories.forEach((category) => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
    });
  });

  // Build the tree structure
  categories.forEach((category) => {
    const node = categoryMap.get(category.id)!;

    if (category.parentId === null) {
      // Root category
      rootCategories.push(node);
    } else {
      // Child category - add to parent's children
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return rootCategories;
}
