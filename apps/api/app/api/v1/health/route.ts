import { NextResponse } from "next/server";
import { prisma } from "@/providers/prisma";
import { pingRedis } from "@/providers/redis";
import { logger } from "@/providers/logger";

export async function GET() {
  const health: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = "ok";
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    health.db = "error";
  }

  try {
    const redisOk = await pingRedis();
    health.redis = redisOk ? "ok" : "error";
  } catch (err) {
    logger.error({ err }, "Redis health check failed");
    health.redis = "error";
  }

  const allOk = Object.values(health).every((v) => v === "ok");
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      success: allOk,
      data: {
        status: allOk ? "ok" : "degraded",
        ...health,
        timestamp: new Date().toISOString(),
        version: "v1",
      },
    },
    { status },
  );
}
