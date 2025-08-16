function coerceToUtcIsoString(input: string): string {
  let s = input.trim();
  if (!s) return s;
  if (s.includes(' ') && !s.includes('T')) {
    s = s.replace(' ', 'T');
  }
  const hasTimezone = /Z$/i.test(s) || /[+-]\d{2}:?\d{2}$/.test(s);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    // Date only → assume midnight UTC
    return `${s}T00:00:00Z`;
  }
  if (!hasTimezone) {
    // Assume provided timestamp is UTC if no timezone present
    return `${s}Z`;
  }
  return s;
}

export function parseUtcDate(iso?: string): Date | null {
  if (!iso) return null;
  const normalized = coerceToUtcIsoString(iso);
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

export function timeAgo(iso?: string): string {
  const d = parseUtcDate(iso);
  if (!d) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
