import { describe, expect, it } from "vitest";
import {
  buildProfileTimeline,
  normalizeBadgesResponse,
  parseProfileXmlTimeline,
} from "./timeline";

describe("profile timeline helpers", () => {
  it("extracts member since from Steam community profile XML", () => {
    expect(
      parseProfileXmlTimeline(`
        <profile>
          <memberSince>September 12, 2003</memberSince>
        </profile>
      `),
    ).toEqual({
      memberSince: "September 12, 2003",
      source: "profile_xml",
    });
  });

  it("extracts member since wrapped in CDATA", () => {
    expect(
      parseProfileXmlTimeline(`
        <profile>
          <memberSince><![CDATA[May 18, 2018]]></memberSince>
        </profile>
      `),
    ).toMatchObject({ memberSince: "May 18, 2018" });
  });

  it("normalizes badge XP and unix completion timestamps", () => {
    expect(
      normalizeBadgesResponse({
        response: {
          player_xp: 225,
          player_level: 2,
          badges: [
            { badgeid: 2, xp: 125, completion_time: 1_700_000_000 },
            { badgeid: 1, xp: 100, completion_time: 1_600_000_000 },
          ],
        },
      }),
    ).toEqual({
      currentLevel: 2,
      currentXp: 225,
      firstBadgeAt: "2020-09-13T12:26:40.000Z",
      firstLevelTwoAt: "2023-11-14T22:13:20.000Z",
      badgesCount: 2,
      source: "player_badges",
    });
  });

  it("combines available public profile and badge data", () => {
    expect(
      buildProfileTimeline({
        steamId: "76561198000000000",
        xml: "<profile><memberSince>January 1, 2017</memberSince></profile>",
        badges: {
          response: {
            player_xp: 100,
            player_level: 1,
            badges: [{ badgeid: 13, xp: 100, completion_time: 1_500_000_000 }],
          },
        },
      }),
    ).toEqual({
      steamId: "76561198000000000",
      memberSince: "January 1, 2017",
      currentLevel: 1,
      currentXp: 100,
      firstBadgeAt: "2017-07-14T02:40:00.000Z",
      badgesCount: 1,
      sources: ["profile_xml", "player_badges"],
      privacyLimited: false,
    });
  });
});
