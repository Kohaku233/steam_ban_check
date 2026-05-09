import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { lookupSteamBatch } from "@/lib/steam/api";

const batchSchema = z.object({
  inputs: z.array(z.string().min(1)).min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const body = batchSchema.parse(await request.json());
    const rows = await lookupSteamBatch(body.inputs);
    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Batch lookup failed" },
      { status: 400 },
    );
  }
}
