import Image from "next/image";
import { CalendarClock, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
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
      {result.timeline ? <ProfileTimeline result={result} /> : null}
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

function ProfileTimeline({ result }: { result: SteamLookupResult }) {
  const timeline = result.timeline;
  if (!timeline) {
    return null;
  }

  const items = [
    {
      icon: CalendarClock,
      label: "Member since",
      value: timeline.memberSince ?? "Unavailable",
      muted: !timeline.memberSince,
      accent: "bg-sky-600",
    },
    {
      icon: Sparkles,
      label: "First badge",
      value: timeline.firstBadgeAt ? formatDateTime(timeline.firstBadgeAt) : "Unavailable",
      muted: !timeline.firstBadgeAt,
      accent: "bg-amber-500",
    },
    {
      icon: ShieldCheck,
      label: "First reached Level 2",
      value: timeline.firstLevelTwoAt ? formatDateTime(timeline.firstLevelTwoAt) : "Not visible / not reached",
      muted: !timeline.firstLevelTwoAt,
      accent: "bg-emerald-600",
    },
  ];

  return (
    <div data-testid="profile-timeline" className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Profile Timeline</h3>
          <p className="mt-1 text-sm text-slate-500">
            Public profile and badge timeline. Private profiles may return partial data.
          </p>
        </div>
        <div className="rounded bg-white px-3 py-1 text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
          Level {timeline.currentLevel ?? "-"} {typeof timeline.currentXp === "number" ? `· ${timeline.currentXp} XP` : ""}
        </div>
      </div>
      <ol
        data-testid="profile-timeline-list"
        aria-label="Profile timeline events"
        className="relative mt-5 grid gap-4 md:grid-cols-3"
      >
        <div className="absolute left-4 top-4 hidden h-px w-[calc(100%-2rem)] bg-slate-200 md:block" aria-hidden="true" />
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="relative rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white ${item.accent}`}>
                  <Icon size={15} />
                </span>
                {item.label}
              </div>
              <div className={item.muted ? "mt-2 text-sm font-semibold text-slate-400" : "mt-2 text-sm font-semibold text-slate-950"}>
                {item.value}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-slate-500">
        Sources: {timeline.sources.length ? timeline.sources.join(", ") : "none"} · Badges:{" "}
        {timeline.badgesCount ?? 0}
      </p>
    </div>
  );
}
