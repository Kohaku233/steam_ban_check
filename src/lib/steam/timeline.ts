import type { SteamProfileTimeline } from "./types";

type RawBadge = {
  badgeid?: number;
  xp?: number;
  completion_time?: number;
};

export type RawBadgesResponse = {
  response?: {
    badges?: RawBadge[];
    player_xp?: number;
    player_level?: number;
  };
};

type TimelineParts = {
  steamId: string;
  xml?: string;
  badges?: RawBadgesResponse;
};

type TimelineSource = NonNullable<SteamProfileTimeline["sources"]>[number];

export function parseProfileXmlTimeline(xml: string): { memberSince?: string; source: TimelineSource } {
  return {
    memberSince: readXmlTag(xml, "memberSince"),
    source: "profile_xml",
  };
}

export function normalizeBadgesResponse(
  payload: RawBadgesResponse,
): Omit<SteamProfileTimeline, "steamId" | "sources" | "privacyLimited"> & { source: TimelineSource } {
  const badges = (payload.response?.badges ?? [])
    .filter((badge) => Number.isFinite(badge.completion_time) && Number.isFinite(badge.xp))
    .map((badge) => ({
      completedAt: Number(badge.completion_time),
      xp: Math.max(0, Number(badge.xp)),
    }))
    .sort((left, right) => left.completedAt - right.completedAt);

  let accumulatedXp = 0;
  let firstLevelTwoAt: string | undefined;
  for (const badge of badges) {
    accumulatedXp += badge.xp;
    if (!firstLevelTwoAt && accumulatedXp >= 200) {
      firstLevelTwoAt = unixSecondsToIso(badge.completedAt);
    }
  }

  return {
    currentLevel: payload.response?.player_level,
    currentXp: payload.response?.player_xp,
    firstBadgeAt: badges[0] ? unixSecondsToIso(badges[0].completedAt) : undefined,
    firstLevelTwoAt,
    badgesCount: payload.response?.badges?.length ?? 0,
    source: "player_badges",
  };
}

export function buildProfileTimeline({ steamId, xml, badges }: TimelineParts): SteamProfileTimeline {
  const sources: TimelineSource[] = [];
  const timeline: SteamProfileTimeline = {
    steamId,
    sources,
    privacyLimited: false,
  };

  if (xml) {
    const profileXml = parseProfileXmlTimeline(xml);
    if (profileXml.memberSince) {
      timeline.memberSince = profileXml.memberSince;
      sources.push(profileXml.source);
    }
  }

  if (badges) {
    const badgeTimeline = normalizeBadgesResponse(badges);
    timeline.currentLevel = badgeTimeline.currentLevel;
    timeline.currentXp = badgeTimeline.currentXp;
    timeline.firstBadgeAt = badgeTimeline.firstBadgeAt;
    timeline.firstLevelTwoAt = badgeTimeline.firstLevelTwoAt;
    timeline.badgesCount = badgeTimeline.badgesCount;
    sources.push(badgeTimeline.source);
  }

  timeline.privacyLimited = sources.length === 0;
  return timeline;
}

function readXmlTag(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  const value = match?.[1]?.trim();
  return value || undefined;
}

function unixSecondsToIso(value: number): string {
  return new Date(value * 1000).toISOString();
}
