// app/api/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { env } from '@/lib/env';

/**
 * Health check endpoint
 * Returns application and database status
 * 
 * GET /api/health
 * 
 * Response:
 * {
 *   status: 'ok' | 'error',
 *   timestamp: string,
 *   uptime: number,
 *   database: 'connected' | 'disconnected',
 *   services: {
 *     database: boolean,
 *     supabase: boolean
 *   }
 * }
 */
export async function GET() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  const healthStatus = {
    status: 'ok' as 'ok' | 'error',
    timestamp,
    uptime: process.uptime(),
    database: 'disconnected' as 'connected' | 'disconnected',
    services: {
      database: false,
      supabase: false,
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: env.app.nodeEnv,
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.database = 'connected';
    healthStatus.services.database = true;
  } catch (error) {
    healthStatus.status = 'error';
    healthStatus.database = 'disconnected';
    healthStatus.services.database = false;
    console.error('Database health check failed:', error);
  }

  // Check Supabase connection (optional - just verify env vars are set)
  try {
    if (env.supabase.url && env.supabase.anonKey) {
      healthStatus.services.supabase = true;
    } else {
      healthStatus.services.supabase = false;
      if (healthStatus.status === 'ok') {
        healthStatus.status = 'error';
      }
    }
  } catch (error) {
    healthStatus.services.supabase = false;
    if (healthStatus.status === 'ok') {
      healthStatus.status = 'error';
    }
    console.error('Supabase health check failed:', error);
  }

  // Calculate response time
  const responseTime = Date.now() - startTime;
  const response = {
    ...healthStatus,
    responseTime: `${responseTime}ms`,
  };

  // Return appropriate status code
  const statusCode = healthStatus.status === 'ok' ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}
