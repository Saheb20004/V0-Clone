import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const db = globalThis.prisma || new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn', 'info'],
});

if (process.env.NODE_ENV === 'development') globalThis.prisma = db;

export default db;
