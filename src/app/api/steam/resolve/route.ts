import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveSteamId } from "@/lib/steam/api";

const resolveSchema = z.object({
  input: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = resolveSchema.parse(await request.json());
    const steamId = await resolveSteamId(body.input);
    return NextResponse.json({ steamId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Resolve failed" },
      { status: 400 },
    );
  }
}
