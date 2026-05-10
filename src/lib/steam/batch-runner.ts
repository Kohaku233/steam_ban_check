import { lookupBatch } from "./client";
import type { BatchLookupRow } from "./types";

export type BatchLookupProgress = {
  completed: number;
  total: number;
  currentChunk: number;
  totalChunks: number;
};

export async function runChunkedBatchLookup(
  inputs: string[],
  options: {
    chunkSize?: number;
    lookup?: (chunk: string[]) => Promise<BatchLookupRow[]>;
    onProgress?: (progress: BatchLookupProgress) => void;
  } = {},
): Promise<BatchLookupRow[]> {
  const chunkSize = options.chunkSize ?? 100;
  const lookup = options.lookup ?? lookupBatch;
  const chunks = chunk(inputs, chunkSize);
  const rows: BatchLookupRow[] = [];

  for (const [index, inputChunk] of chunks.entries()) {
    try {
      rows.push(...(await lookup(inputChunk)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Batch lookup failed";
      rows.push(...inputChunk.map((input): BatchLookupRow => ({ input, status: "failed", error: message })));
    }

    options.onProgress?.({
      completed: Math.min(rows.length, inputs.length),
      total: inputs.length,
      currentChunk: index + 1,
      totalChunks: chunks.length,
    });
  }

  return rows;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
