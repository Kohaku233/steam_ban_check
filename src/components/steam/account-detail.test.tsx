import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountDetail } from "./account-detail";
import type { SteamLookupResult } from "@/lib/steam/types";

const result: SteamLookupResult = {
  input: "76561198793065986",
  steamId: "76561198793065986",
  profile: {
    steamId: "76561198793065986",
    personaName: "Jonny Joster",
    profileUrl: "https://steamcommunity.com/profiles/76561198793065986/",
    avatarUrl: "",
    visibilityState: 3,
  },
  ban: {
    steamId: "76561198793065986",
    communityBanned: false,
    vacBanned: false,
    numberOfVacBans: 0,
    daysSinceLastBan: 0,
    numberOfGameBans: 0,
    economyBan: "none",
  },
  timeline: {
    steamId: "76561198793065986",
    memberSince: "August 25, 2025",
    currentLevel: 1,
    currentXp: 106,
    firstBadgeAt: "2026-03-01T18:17:27.000Z",
    badgesCount: 1,
    sources: ["profile_xml", "player_badges"],
    privacyLimited: false,
  },
  checkedAt: "2026-05-10T00:00:00.000Z",
};

describe("AccountDetail", () => {
  it("renders profile timeline as a light panel", () => {
    render(<AccountDetail result={result} />);

    const timeline = screen.getByText("Profile Timeline").closest("[data-testid='profile-timeline']");

    expect(timeline).toHaveClass("bg-slate-50");
    expect(timeline).not.toHaveClass("bg-slate-950");
  });
});
