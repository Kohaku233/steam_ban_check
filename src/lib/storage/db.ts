"use client";

import Dexie, { type Table } from "dexie";
import type { AccountCollection, QueryRun, StoredLookupResult } from "./types";

class SteamBanCheckerDb extends Dexie {
  collections!: Table<AccountCollection, string>;
  queryRuns!: Table<QueryRun, string>;
  results!: Table<StoredLookupResult, string>;

  constructor() {
    super("steam-ban-checker");
    this.version(1).stores({
      collections: "id, name, updatedAt, lastQueriedAt",
      queryRuns: "id, kind, collectionId, createdAt",
      results: "id, steamId, checkedAt",
    });
  }
}

export const db = new SteamBanCheckerDb();
