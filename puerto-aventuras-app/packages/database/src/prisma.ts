/**
 * Database Package - Prisma Client
 *
 * Generated Prisma Client with singleton pattern for efficient connection management
 */

import { PrismaClient as PrismaClientGenerated } from './generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting database connections due to hot reloading in Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClientGenerated };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientGenerated({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export all types from generated Prisma client
export * from './generated/prisma';

// Default export
export { PrismaClientGenerated as PrismaClient };
