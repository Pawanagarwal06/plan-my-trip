import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET() {
  const status = {
    database: 'down',
    redis: 'down',
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Check PostgreSQL via Prisma
    await prisma.$queryRaw`SELECT 1`;
    status.database = 'up';
  } catch (e) {
    console.error('Database health check failed:', e);
  }

  try {
    // 2. Check Upstash Redis
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
    await redis.ping();
    status.redis = 'up';
  } catch (e) {
    console.error('Redis health check failed:', e);
  }

  const isHealthy = status.database === 'up' && status.redis === 'up';

  return NextResponse.json(status, {
    status: isHealthy ? 200 : 503
  });
}
