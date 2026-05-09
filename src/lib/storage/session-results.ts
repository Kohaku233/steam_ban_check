"use client";

import type { BatchLookupRow } from "@/lib/steam/types";

const CURRENT_BATCH_KEY = "bandesk.currentBatchResult";

export type CurrentBatchResult = {
  title: string;
  rows: BatchLookupRow[];
  source: "import" | "collection";
  createdAt: string;
};

export function saveCurrentBatchResult(result: Omit<CurrentBatchResult, "createdAt">) {
  sessionStorage.setItem(CURRENT_BATCH_KEY, JSON.stringify({ ...result, createdAt: new Date().toISOString() }));
}

export function consumeCurrentBatchResult(): CurrentBatchResult | null {
  const raw = sessionStorage.getItem(CURRENT_BATCH_KEY);
  if (!raw) {
    return null;
  }
  sessionStorage.removeItem(CURRENT_BATCH_KEY);
  return JSON.parse(raw) as CurrentBatchResult;
}
