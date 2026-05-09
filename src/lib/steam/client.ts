import type { BatchLookupRow, SteamLookupResult } from "./types";

export async function fetchHealth(): Promise<{ steamApiKeyConfigured: boolean }> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Unable to read local API status");
  }
  return response.json();
}

export async function lookupAccount(input: string): Promise<SteamLookupResult> {
  const response = await fetch("/api/steam/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Lookup failed");
  }
  return payload.result;
}

export async function lookupBatch(inputs: string[]): Promise<BatchLookupRow[]> {
  const response = await fetch("/api/steam/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Batch lookup failed");
  }
  return payload.rows;
}
