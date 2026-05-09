import type { BatchLookupRow } from "@/lib/steam/types";
import type { QuerySummary } from "./types";

export function summarizeBatchRows(rows: BatchLookupRow[]): QuerySummary {
  return rows.reduce<QuerySummary>(
    (summary, row) => {
      summary.total += 1;
      if (row.status === "failed") {
        summary.failed += 1;
        return summary;
      }

      const ban = row.result.ban;
      if (ban.vacBanned || ban.numberOfGameBans > 0 || ban.communityBanned || ban.economyBan !== "none") {
        summary.banned += 1;
      } else {
        summary.clean += 1;
      }
      return summary;
    },
    { total: 0, clean: 0, banned: 0, failed: 0 },
  );
}
