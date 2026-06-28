/**
 * App timezone for memory dates (Jo & Ru — GMT+8).
 * Override with NEXT_PUBLIC_APP_TIMEZONE if needed.
 */
export const APP_TIMEZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Asia/Singapore";

const APP_UTC_OFFSET = "+08:00";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Value for `<input type="datetime-local" />` in the user's local clock. */
export function toDatetimeLocalValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Parse a stored memory date/timestamp for display.
 * Date-only values (legacy) are treated as midnight in the app timezone (GMT+8).
 */
export function parseMemoryDate(value: string): Date {
  if (DATE_ONLY.test(value)) {
    return new Date(`${value}T00:00:00${APP_UTC_OFFSET}`);
  }
  return new Date(value);
}

/** Normalize API/client input to ISO UTC for timestamptz storage. */
export function normalizeMemoryDateForStorage(input: string): string {
  if (DATE_ONLY.test(input)) {
    return new Date(`${input}T00:00:00${APP_UTC_OFFSET}`).toISOString();
  }

  // datetime-local without offset: interpret in app timezone
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
    return new Date(`${input}:00${APP_UTC_OFFSET}`).toISOString();
  }

  return new Date(input).toISOString();
}

const DISPLAY_DATE: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIMEZONE,
  month: "long",
  day: "numeric",
  year: "numeric",
};

const DISPLAY_DATETIME: Intl.DateTimeFormatOptions = {
  ...DISPLAY_DATE,
  hour: "numeric",
  minute: "2-digit",
};

export function formatMemoryDate(date: string | Date): string {
  const d = typeof date === "string" ? parseMemoryDate(date) : date;
  return d.toLocaleDateString("en-US", DISPLAY_DATE);
}

export function formatMemoryDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseMemoryDate(date) : date;
  return d.toLocaleString("en-US", DISPLAY_DATETIME);
}

export function getYear(date: string | Date): number {
  const d = typeof date === "string" ? parseMemoryDate(date) : date;
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIMEZONE,
      year: "numeric",
    }).format(d),
  );
}

export function getMonthName(date: string | Date): string {
  const d = typeof date === "string" ? parseMemoryDate(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    month: "long",
  }).format(d);
}

export interface TimelineGroup {
  year: number;
  months: {
    month: string;
    memories: { id: string; title: string; date: string }[];
  }[];
}

export function groupMemoriesByTimeline(
  memories: { id: string; title: string; date: string }[],
): TimelineGroup[] {
  const sorted = [...memories].sort(
    (a, b) =>
      parseMemoryDate(b.date).getTime() - parseMemoryDate(a.date).getTime(),
  );

  const yearMap = new Map<
    number,
    Map<string, { id: string; title: string; date: string }[]>
  >();

  for (const memory of sorted) {
    const year = getYear(memory.date);
    const month = getMonthName(memory.date);

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map());
    }
    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }
    monthMap.get(month)!.push(memory);
  }

  return Array.from(yearMap.entries()).map(([year, monthMap]) => ({
    year,
    months: Array.from(monthMap.entries()).map(([month, items]) => ({
      month,
      memories: items,
    })),
  }));
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
