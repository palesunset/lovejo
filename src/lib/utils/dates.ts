const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function formatMemoryDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMemoryDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getYear(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getFullYear();
}

export function getMonthName(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return MONTH_NAMES[d.getMonth()];
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
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const yearMap = new Map<number, Map<string, { id: string; title: string; date: string }[]>>();

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
