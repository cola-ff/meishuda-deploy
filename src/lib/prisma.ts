import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Use Neon's Prisma URL if available, otherwise fall back to DATABASE_URL
const databaseUrl = process.env.NEON_POSTGRES_PRISMA_URL || process.env.DATABASE_URL

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
