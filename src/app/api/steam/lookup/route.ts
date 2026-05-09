import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { lookupSteamAccount } from "@/lib/steam/api";

const lookupSchema = z.object({
  input: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = lookupSchema.parse(await request.json());
    const result = await lookupSteamAccount(body.input);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lookup failed" },
      { status: 400 },
    );
  }
}
