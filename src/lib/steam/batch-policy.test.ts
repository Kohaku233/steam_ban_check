import { describe, expect, it } from "vitest";
import { hasAnySuccessfulLookup } from "./batch-policy";

describe("hasAnySuccessfulLookup", () => {
  it("returns false when every row failed", () => {
    expect(
      hasAnySuccessfulLookup([
        { input: "a", status: "failed", error: "bad" },
        { input: "b", status: "failed", error: "bad" },
      ]),
    ).toBe(false);
  });

  it("returns true when at least one row succeeded", () => {
    expect(
      hasAnySuccessfulLookup([
        { input: "a", status: "failed", error: "bad" },
        {
          input: "b",
          status: "success",
          result: {
            input: "b",
            steamId: "76561198000000000",
            checkedAt: "now",
            ban: {
              steamId: "76561198000000000",
              communityBanned: false,
              vacBanned: false,
              numberOfVacBans: 0,
              daysSinceLastBan: 0,
              numberOfGameBans: 0,
              economyBan: "none",
            },
          },
        },
      ]),
    ).toBe(true);
  });
});
