import { describe, expect, it } from "vitest";
import { normalizeBanResponse, normalizeProfileResponse } from "./api";

describe("steam api normalizers", () => {
  it("normalizes ban response rows", () => {
    expect(
      normalizeBanResponse({
        SteamId: "76561198000000000",
        CommunityBanned: false,
        VACBanned: true,
        NumberOfVACBans: 2,
        DaysSinceLastBan: 14,
        NumberOfGameBans: 1,
        EconomyBan: "none",
      }),
    ).toEqual({
      steamId: "76561198000000000",
      communityBanned: false,
      vacBanned: true,
      numberOfVacBans: 2,
      daysSinceLastBan: 14,
      numberOfGameBans: 1,
      economyBan: "none",
    });
  });

  it("normalizes profile rows", () => {
    expect(
      normalizeProfileResponse({
        steamid: "76561198000000000",
        personaname: "Player",
        profileurl: "https://steamcommunity.com/profiles/76561198000000000/",
        avatarfull: "https://avatar.example/full.jpg",
        communityvisibilitystate: 3,
      }),
    ).toEqual({
      steamId: "76561198000000000",
      personaName: "Player",
      profileUrl: "https://steamcommunity.com/profiles/76561198000000000/",
      avatarUrl: "https://avatar.example/full.jpg",
      visibilityState: 3,
    });
  });
});
