import { DayContribution } from "./types";

export function mergeCalendars(
  ...calendars: DayContribution[][]
): DayContribution[] {
  const dateMap = new Map<string, number>();

  for (const calendar of calendars) {
    for (const day of calendar) {
      dateMap.set(day.date, (dateMap.get(day.date) || 0) + day.count);
    }
  }

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
