import type { BatchLookupRow } from "./types";

export function hasAnySuccessfulLookup(rows: BatchLookupRow[]) {
  return rows.some((row) => row.status === "success");
}
