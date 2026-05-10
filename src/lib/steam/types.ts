export type SteamBanStatus = {
  steamId: string;
  communityBanned: boolean;
  vacBanned: boolean;
  numberOfVacBans: number;
  daysSinceLastBan: number;
  numberOfGameBans: number;
  economyBan: string;
};

export type SteamProfileSummary = {
  steamId: string;
  personaName: string;
  profileUrl: string;
  avatarUrl: string;
  visibilityState?: number;
};

export type SteamProfileTimeline = {
  steamId: string;
  memberSince?: string;
  currentLevel?: number;
  currentXp?: number;
  firstBadgeAt?: string;
  firstLevelTwoAt?: string;
  badgesCount?: number;
  sources: Array<"profile_xml" | "player_badges">;
  privacyLimited: boolean;
};

export type SteamLookupResult = {
  input: string;
  steamId: string;
  profile?: SteamProfileSummary;
  timeline?: SteamProfileTimeline;
  ban: SteamBanStatus;
  checkedAt: string;
};

export type BatchLookupRow =
  | { input: string; status: "success"; result: SteamLookupResult }
  | { input: string; status: "failed"; error: string };
