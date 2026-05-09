import { describe, expect, it } from "vitest";
import { parseSteamIdentifier } from "./parse";

describe("parseSteamIdentifier", () => {
  it("accepts SteamID64 values", () => {
    expect(parseSteamIdentifier("76561198000000000")).toEqual({
      kind: "steamid64",
      value: "76561198000000000",
      raw: "76561198000000000",
    });
  });

  it("extracts SteamID64 from profile URLs", () => {
    expect(
      parseSteamIdentifier("https://steamcommunity.com/profiles/76561198000000000/"),
    ).toMatchObject({ kind: "steamid64", value: "76561198000000000" });
  });

  it("extracts vanity names from id URLs", () => {
    expect(parseSteamIdentifier("https://steamcommunity.com/id/valve")).toMatchObject({
      kind: "vanity",
      value: "valve",
    });
  });

  it("treats plain non-url text as vanity", () => {
    expect(parseSteamIdentifier("  someUser_42  ")).toMatchObject({
      kind: "vanity",
      value: "someUser_42",
    });
  });

  it("rejects empty and unsupported inputs", () => {
    expect(parseSteamIdentifier("")).toBeNull();
    expect(parseSteamIdentifier("https://example.com/id/valve")).toBeNull();
  });
});
