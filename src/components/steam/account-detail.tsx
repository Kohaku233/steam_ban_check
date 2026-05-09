import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { SteamLookupResult } from "@/lib/steam/types";
import { formatDateTime } from "@/lib/utils";
import { StatusPill } from "@/components/ui/status-pill";
import { banLabel, hasAnyBan } from "./ban-helpers";

export function AccountDetail({ result }: { result: SteamLookupResult }) {
  const profile = result.profile;
  const banned = hasAnyBan(result.ban);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-slate-100">
            {profile?.avatarUrl ? (
              <Image src={profile.avatarUrl} alt="" fill sizes="64px" className="object-cover" unoptimized />
            ) : null}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{profile?.personaName ?? "Unknown profile"}</h2>
              <StatusPill tone={banned ? "danger" : "clean"}>{banLabel(result.ban)}</StatusPill>
            </div>
            <p className="mt-1 text-sm text-slate-500">{result.steamId}</p>
          </div>
        </div>
        {profile?.profileUrl ? (
          <a
            href={profile.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            Open Steam profile <ExternalLink size={15} />
          </a>
        ) : null}
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="VAC" value={result.ban.vacBanned ? "Banned" : "Clean"} danger={result.ban.vacBanned} />
        <Metric label="Game bans" value={String(result.ban.numberOfGameBans)} danger={result.ban.numberOfGameBans > 0} />
        <Metric label="Economy" value={result.ban.economyBan} danger={result.ban.economyBan !== "none"} />
        <Metric label="Last ban" value={result.ban.daysSinceLastBan ? `${result.ban.daysSinceLastBan} days` : "-"} />
      </dl>
      <p className="mt-4 text-xs text-slate-500">Checked {formatDateTime(result.checkedAt)}</p>
    </section>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={danger ? "mt-1 text-lg font-bold text-rose-700" : "mt-1 text-lg font-bold text-slate-950"}>
        {value}
      </dd>
    </div>
  );
}
