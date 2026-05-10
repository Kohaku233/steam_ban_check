import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BatchResultsTable } from "./batch-results-table";
import { lookupAccount } from "@/lib/steam/client";
import type { BatchLookupRow, SteamLookupResult } from "@/lib/steam/types";

vi.mock("@/lib/steam/client", () => ({
  lookupAccount: vi.fn(),
}));

const baseResult: SteamLookupResult = {
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
  checkedAt: "2026-05-10T00:00:00.000Z",
};

function makeRow(index: number): BatchLookupRow {
  const steamId = `7656119800000${String(index).padStart(5, "0")}`;
  return {
    input: steamId,
    status: "success",
    result: {
      ...baseResult,
      input: steamId,
      steamId,
      profile: {
        ...baseResult.profile!,
        steamId,
        personaName: `Account ${index}`,
      },
      ban: {
        ...baseResult.ban,
        steamId,
      },
    },
  };
}

describe("BatchResultsTable", () => {
  beforeEach(() => {
    vi.mocked(lookupAccount).mockReset();
  });

  it("loads full account details when a compact batch row is selected", async () => {
    vi.mocked(lookupAccount).mockResolvedValue({
      ...baseResult,
      timeline: {
        steamId: baseResult.steamId,
        memberSince: "August 25, 2025",
        currentLevel: 1,
        currentXp: 106,
        firstBadgeAt: "2026-03-01T18:17:27.000Z",
        badgesCount: 1,
        sources: ["profile_xml", "player_badges"],
        privacyLimited: false,
      },
    });

    const rows: BatchLookupRow[] = [{ input: baseResult.input, status: "success", result: baseResult }];
    render(<BatchResultsTable rows={rows} />);

    await userEvent.click(screen.getByText("Jonny Joster"));

    await waitFor(() => expect(lookupAccount).toHaveBeenCalledWith("76561198793065986"));
    expect(await screen.findByText("August 25, 2025")).toBeInTheDocument();
  });

  it("paginates large batch result sets", async () => {
    render(<BatchResultsTable rows={Array.from({ length: 101 }, (_, index) => makeRow(index + 1))} />);

    expect(screen.getByText("Account 1")).toBeInTheDocument();
    expect(screen.queryByText("Account 101")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1-100 / 101")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("Account 101")).toBeInTheDocument();
    expect(screen.queryByText("Account 1")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 101-101 / 101")).toBeInTheDocument();
  });
});
