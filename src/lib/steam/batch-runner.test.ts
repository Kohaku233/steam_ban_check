import { describe, expect, it, vi } from "vitest";
import { runChunkedBatchLookup } from "./batch-runner";
import type { BatchLookupRow } from "./types";

function successRow(input: string): BatchLookupRow {
  return {
    input,
    status: "success",
    result: {
      input,
      steamId: input,
      ban: {
        steamId: input,
        communityBanned: false,
        vacBanned: false,
        numberOfVacBans: 0,
        daysSinceLastBan: 0,
        numberOfGameBans: 0,
        economyBan: "none",
      },
      checkedAt: "2026-05-10T00:00:00.000Z",
    },
  };
}

describe("runChunkedBatchLookup", () => {
  it("queries 1000 accounts in 100-account chunks and reports progress", async () => {
    const inputs = Array.from({ length: 1000 }, (_, index) => `7656119800000${String(index).padStart(5, "0")}`);
    const lookup = vi.fn(async (chunk: string[]) => chunk.map(successRow));
    const progress = vi.fn();

    const rows = await runChunkedBatchLookup(inputs, { lookup, chunkSize: 100, onProgress: progress });

    expect(rows).toHaveLength(1000);
    expect(lookup).toHaveBeenCalledTimes(10);
    expect(lookup.mock.calls[0][0]).toHaveLength(100);
    expect(progress).toHaveBeenLastCalledWith({ completed: 1000, total: 1000, currentChunk: 10, totalChunks: 10 });
  });

  it("turns a failed chunk into failed rows instead of aborting the full import", async () => {
    const lookup = vi
      .fn<[(string[])], Promise<BatchLookupRow[]>>()
      .mockResolvedValueOnce([successRow("a")])
      .mockRejectedValue(new Error("Steam rate limited"));

    const rows = await runChunkedBatchLookup(["a", "b", "c"], { lookup, chunkSize: 1 });

    expect(rows).toEqual([
      successRow("a"),
      { input: "b", status: "failed", error: "Steam rate limited" },
      { input: "c", status: "failed", error: "Steam rate limited" },
    ]);
  });
});
