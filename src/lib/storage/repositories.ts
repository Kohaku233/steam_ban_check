"use client";

import type { BatchLookupRow } from "@/lib/steam/types";
import { db } from "./db";
import { summarizeBatchRows } from "./summary";
import type { AccountCollection, QueryRun } from "./types";

export async function createCollection(input: {
  name: string;
  sourceFileName: string;
  identifiers: string[];
}): Promise<AccountCollection> {
  const now = new Date().toISOString();
  const collection: AccountCollection = {
    id: crypto.randomUUID(),
    name: input.name,
    sourceFileName: input.sourceFileName,
    identifiers: input.identifiers,
    createdAt: now,
    updatedAt: now,
  };
  await db.collections.add(collection);
  return collection;
}

export async function listCollections(): Promise<AccountCollection[]> {
  return db.collections.orderBy("updatedAt").reverse().toArray();
}

export async function deleteCollection(id: string): Promise<void> {
  await db.collections.delete(id);
}

export async function renameCollection(id: string, name: string): Promise<void> {
  await db.collections.update(id, { name, updatedAt: new Date().toISOString() });
}

export async function getCollection(id: string): Promise<AccountCollection | undefined> {
  return db.collections.get(id);
}

export async function saveQueryRun(input: {
  kind: "single" | "batch";
  title: string;
  inputs: string[];
  rows: BatchLookupRow[];
  collectionId?: string;
}): Promise<QueryRun> {
  const now = new Date().toISOString();
  const run: QueryRun = {
    id: crypto.randomUUID(),
    createdAt: now,
    summary: summarizeBatchRows(input.rows),
    ...input,
  };

  await db.transaction("rw", db.queryRuns, db.collections, db.results, async () => {
    await db.queryRuns.add(run);
    await db.results.bulkPut(
      input.rows
        .filter((row) => row.status === "success")
        .map((row) => ({
          ...row.result,
          id: row.result.steamId,
        })),
    );
    if (input.collectionId) {
      await db.collections.update(input.collectionId, {
        lastQueriedAt: now,
        latestRunId: run.id,
        updatedAt: now,
      });
    }
  });

  return run;
}

export async function listQueryRuns(): Promise<QueryRun[]> {
  return db.queryRuns.orderBy("createdAt").reverse().toArray();
}
