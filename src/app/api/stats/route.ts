import { NextResponse } from "next/server";

export async function GET() {
  const stats = {
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: Math.round(process.uptime()),
    },
    memory: {
      total: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB",
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + "MB",
    },
    app: {
      name: "ISO Progress System",
      version: "1.0.0",
      status: "running",
    },
  };

  return NextResponse.json(stats, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
