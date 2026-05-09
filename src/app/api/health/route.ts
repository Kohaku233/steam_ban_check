import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    steamApiKeyConfigured: Boolean(process.env.STEAM_API_KEY),
  });
}
