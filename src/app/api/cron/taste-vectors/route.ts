import { NextRequest, NextResponse } from "next/server";
import { updateAllTasteVectors } from "@/lib/compatibility/taste-vector-cron";

/**
 * POST /api/cron/taste-vectors
 *
 * Nightly cron job to update taste vectors for all users.
 * Protected by CRON_SECRET header.
 *
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/taste-vectors",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await updateAllTasteVectors();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update taste vectors" },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request);
}
