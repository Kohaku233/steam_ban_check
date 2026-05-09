export type ParsedSteamIdentifier =
  | { kind: "steamid64"; value: string; raw: string }
  | { kind: "vanity"; value: string; raw: string };

const STEAM_ID64_PATTERN = /^7656\d{13}$/;
const VANITY_PATTERN = /^[a-zA-Z0-9_-]{2,64}$/;

export function parseSteamIdentifier(input: string): ParsedSteamIdentifier | null {
  const raw = input.trim();
  if (!raw) {
    return null;
  }

  if (STEAM_ID64_PATTERN.test(raw)) {
    return { kind: "steamid64", value: raw, raw };
  }

  const profileMatch = raw.match(/^https?:\/\/steamcommunity\.com\/profiles\/(7656\d{13})(?:[/?#].*)?$/i);
  if (profileMatch) {
    return { kind: "steamid64", value: profileMatch[1], raw };
  }

  const vanityMatch = raw.match(/^https?:\/\/steamcommunity\.com\/id\/([^/?#]+)(?:[/?#].*)?$/i);
  if (vanityMatch && VANITY_PATTERN.test(vanityMatch[1])) {
    return { kind: "vanity", value: vanityMatch[1], raw };
  }

  if (/^https?:\/\//i.test(raw)) {
    return null;
  }

  if (VANITY_PATTERN.test(raw)) {
    return { kind: "vanity", value: raw, raw };
  }

  return null;
}
