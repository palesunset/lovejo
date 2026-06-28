/**
 * App timezone for memory dates (Jo & Ru — GMT+8).
 * Override with NEXT_PUBLIC_APP_TIMEZONE if needed.
 */
export const APP_TIMEZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Asia/Singapore";

const APP_UTC_OFFSET = "+08:00";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Postgres/Supabase timestamptz sometimes omits Z — treat as UTC, not local. */
const TIMESTAMP_WITHOUT_OFFSET =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d{1,6})?$/;

/** datetime-local values from the form (no seconds or with seconds, no offset). */
const DATETIME_LOCAL =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/** Value for `<input type="datetime-local" />` in the app timezone (GMT+8). */
export function toDatetimeLocalValue(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

/**
 * Parse a stored memory date/timestamp for display.
 * Date-only values (legacy) are treated as midnight in the app timezone (GMT+8).
 */
export function parseMemoryDate(value: string): Date {
  if (DATE_ONLY.test(value)) {
    return new Date(`${value}T00:00:00${APP_UTC_OFFSET}`);
  }

  if (TIMESTAMP_WITHOUT_OFFSET.test(value)) {
    const iso = value.includes(" ") ? value.replace(" ", "T") : value;
    return new Date(`${iso}Z`);
  }

  return new Date(value);
}

/** Normalize API/client input to ISO UTC for timestamptz storage. */
export function normalizeMemoryDateForStorage(input: string): string {
  if (DATE_ONLY.test(input)) {
    return new Date(`${input}T00:00:00${APP_UTC_OFFSET}`).toISOString();
  }

  // datetime-local without offset: interpret in app timezone
  if (DATETIME_LOCAL.test(input)) {
    const withSeconds = input.length === 16 ? `${input}:00` : input;
    return new Date(`${withSeconds}${APP_UTC_OFFSET}`).toISOString();
  }

  return new Date(input).toISOString();
}

const DISPLAY_DATE: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIMEZONE,
  month: "long",
  day: "numeric",
  year: "numeric",
};

export function formatMemoryDate(date: string | Date): string {
  const d = typeof date === "string" ? parseMemoryDate(date) : date;
  return d.toLocaleDateString("en-US", DISPLAY_DATE);
}

const memoryDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatMemoryDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseMemoryDate(date) : date;
  return memoryDateTimeFormatter.format(d);
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
