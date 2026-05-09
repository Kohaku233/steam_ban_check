import { parseSteamIdentifier } from "./parse";
import type { BatchLookupRow, SteamBanStatus, SteamLookupResult, SteamProfileSummary } from "./types";

const STEAM_API_BASE = "https://api.steampowered.com";

type RawBanResponse = {
  SteamId: string;
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string;
};

type RawProfileResponse = {
  steamid: string;
  personaname?: string;
  profileurl?: string;
  avatarfull?: string;
  communityvisibilitystate?: number;
};

export function getSteamApiKey(): string {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    throw new Error("STEAM_API_KEY is not configured");
  }
  return apiKey;
}

export function normalizeBanResponse(row: RawBanResponse): SteamBanStatus {
  return {
    steamId: row.SteamId,
    communityBanned: row.CommunityBanned,
    vacBanned: row.VACBanned,
    numberOfVacBans: row.NumberOfVACBans,
    daysSinceLastBan: row.DaysSinceLastBan,
    numberOfGameBans: row.NumberOfGameBans,
    economyBan: row.EconomyBan,
  };
}

export function normalizeProfileResponse(row: RawProfileResponse): SteamProfileSummary {
  return {
    steamId: row.steamid,
    personaName: row.personaname ?? "Unknown",
    profileUrl: row.profileurl ?? `https://steamcommunity.com/profiles/${row.steamid}/`,
    avatarUrl: row.avatarfull ?? "",
    visibilityState: row.communityvisibilitystate,
  };
}

export async function lookupSteamAccount(input: string): Promise<SteamLookupResult> {
  const steamId = await resolveSteamId(input);
  const [banMap, profileMap] = await Promise.all([fetchPlayerBans([steamId]), fetchPlayerSummaries([steamId])]);
  const ban = banMap.get(steamId);
  if (!ban) {
    throw new Error("Steam returned no ban data for this account");
  }

  return {
    input,
    steamId,
    ban,
    profile: profileMap.get(steamId),
    checkedAt: new Date().toISOString(),
  };
}

export async function lookupSteamBatch(inputs: string[]): Promise<BatchLookupRow[]> {
  const uniqueInputs = Array.from(new Set(inputs.map((input) => input.trim()).filter(Boolean)));
  return Promise.all(
    uniqueInputs.map(async (input) => {
      try {
        return { input, status: "success", result: await lookupSteamAccount(input) } satisfies BatchLookupRow;
      } catch (error) {
        return {
          input,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown lookup error",
        } satisfies BatchLookupRow;
      }
    }),
  );
}

export async function resolveSteamId(input: string): Promise<string> {
  const parsed = parseSteamIdentifier(input);
  if (!parsed) {
    throw new Error("Unsupported Steam identifier");
  }

  if (parsed.kind === "steamid64") {
    return parsed.value;
  }

  const apiKey = getSteamApiKey();
  const url = new URL(`${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("vanityurl", parsed.value);

  const response = await fetchJson<{ response?: { success?: number; steamid?: string; message?: string } }>(url);
  const payload = response.response;
  if (payload?.success !== 1 || !payload.steamid) {
    throw new Error(payload?.message || "Unable to resolve vanity URL");
  }
  return payload.steamid;
}

async function fetchPlayerBans(steamIds: string[]): Promise<Map<string, SteamBanStatus>> {
  const apiKey = getSteamApiKey();
  const url = new URL(`${STEAM_API_BASE}/ISteamUser/GetPlayerBans/v1/`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamids", steamIds.join(","));

  const data = await fetchJson<{ players?: RawBanResponse[] }>(url);
  return new Map((data.players ?? []).map((row) => [row.SteamId, normalizeBanResponse(row)]));
}

async function fetchPlayerSummaries(steamIds: string[]): Promise<Map<string, SteamProfileSummary>> {
  const apiKey = getSteamApiKey();
  const url = new URL(`${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamids", steamIds.join(","));

  const data = await fetchJson<{ response?: { players?: RawProfileResponse[] } }>(url);
  return new Map((data.response?.players ?? []).map((row) => [row.steamid, normalizeProfileResponse(row)]));
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Steam API request failed with HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}
