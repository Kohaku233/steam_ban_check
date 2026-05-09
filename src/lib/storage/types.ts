import type { BatchLookupRow, SteamLookupResult } from "@/lib/steam/types";

export type AccountCollection = {
  id: string;
  name: string;
  sourceFileName: string;
  identifiers: string[];
  createdAt: string;
  updatedAt: string;
  lastQueriedAt?: string;
  latestRunId?: string;
};

export type QueryRun = {
  id: string;
  kind: "single" | "batch";
  collectionId?: string;
  title: string;
  inputs: string[];
  rows: BatchLookupRow[];
  summary: QuerySummary;
  createdAt: string;
};

export type QuerySummary = {
  total: number;
  clean: number;
  banned: number;
  failed: number;
};

export type StoredLookupResult = SteamLookupResult & {
  id: string;
};
