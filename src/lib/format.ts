export function euro(n?: number | null, opts: { perDay?: boolean } = {}): string {
  if (n == null) return "—";
  const s = new Intl.NumberFormat("fr-LU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
  return opts.perDay ? `${s} / jour` : s;
}

export function num(n?: number | null, unit = ""): string {
  if (n == null) return "—";
  const s = new Intl.NumberFormat("fr-LU").format(n);
  return unit ? `${s} ${unit}` : s;
}

export function km(n?: number | null): string {
  if (n == null) return "—";
  return `${new Intl.NumberFormat("fr-LU").format(n)} km`;
}

export function dateFr(d?: Date | string | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-LU", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(d),
  );
}

export function dateTimeFr(d?: Date | string | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-LU", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

export function dateShort(d?: Date | string | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-LU", { day: "2-digit", month: "2-digit" }).format(new Date(d));
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function coverOf(
  photos?: { url: string; cover: boolean; ordre: number }[] | null,
): string | null {
  const real = (photos ?? []).filter((p) => p.url);
  if (real.length === 0) return null;
  const cover = real.find((p) => p.cover);
  if (cover) return cover.url;
  return [...real].sort((a, b) => a.ordre - b.ordre)[0].url;
}

export function parseJson<T>(s?: string | null, fallback?: T): T {
  if (!s) return (fallback ?? ([] as unknown as T));
  try {
    return JSON.parse(s) as T;
  } catch {
    return (fallback ?? ([] as unknown as T));
  }
}
