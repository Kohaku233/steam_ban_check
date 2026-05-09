import { describe, expect, it } from "vitest";
import { parseAccountImport } from "./parse-import";

describe("parseAccountImport", () => {
  it("parses txt line lists and removes duplicates", () => {
    expect(parseAccountImport("one\n two \n\none", "accounts.txt")).toEqual({
      name: "accounts.txt",
      identifiers: ["one", "two"],
      rejectedRows: [],
    });
  });

  it("parses the first useful csv column", () => {
    expect(
      parseAccountImport("steamid,note\n76561198000000000,main\nhttps://steamcommunity.com/id/valve,dev", "list.csv"),
    ).toMatchObject({
      identifiers: ["76561198000000000", "https://steamcommunity.com/id/valve"],
    });
  });

  it("tracks rows with no usable identifier", () => {
    expect(parseAccountImport("steamid,note\n76561198000000000,main\n,missing", "bad.csv").rejectedRows).toEqual([
      { row: 3, reason: "No Steam identifier found" },
    ]);
  });

  it("throws on empty imports", () => {
    expect(() => parseAccountImport("\n\n", "empty.txt")).toThrow("No Steam identifiers found");
  });
});
