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

export type SteamLookupResult = {
  input: string;
  steamId: string;
  profile?: SteamProfileSummary;
  ban: SteamBanStatus;
  checkedAt: string;
};

export type BatchLookupRow =
  | { input: string; status: "success"; result: SteamLookupResult }
  | { input: string; status: "failed"; error: string };
