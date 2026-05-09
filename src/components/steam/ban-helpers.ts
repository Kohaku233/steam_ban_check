import type { SteamBanStatus } from "@/lib/steam/types";

export function hasAnyBan(ban: SteamBanStatus) {
  return ban.communityBanned || ban.vacBanned || ban.numberOfGameBans > 0 || ban.economyBan !== "none";
}

export function banLabel(ban: SteamBanStatus) {
  return hasAnyBan(ban) ? "Flagged" : "Clean";
}
