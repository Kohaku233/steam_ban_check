import { describe, expect, it } from "vitest";
import { summarizeBatchRows } from "./summary";

describe("summarizeBatchRows", () => {
  it("counts clean, banned, and failed rows", () => {
    expect(
      summarizeBatchRows([
        {
          input: "a",
          status: "success",
          result: {
            input: "a",
            steamId: "1",
            checkedAt: "now",
            ban: {
              steamId: "1",
              communityBanned: false,
              vacBanned: false,
              numberOfVacBans: 0,
              daysSinceLastBan: 0,
              numberOfGameBans: 0,
              economyBan: "none",
            },
          },
        },
        {
          input: "b",
          status: "success",
          result: {
            input: "b",
            steamId: "2",
            checkedAt: "now",
            ban: {
              steamId: "2",
              communityBanned: false,
              vacBanned: true,
              numberOfVacBans: 1,
              daysSinceLastBan: 5,
              numberOfGameBans: 0,
              economyBan: "none",
            },
          },
        },
        { input: "c", status: "failed", error: "bad" },
      ]),
    ).toEqual({ total: 3, clean: 1, banned: 1, failed: 1 });
  });
});
