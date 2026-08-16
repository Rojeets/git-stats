import { DayContribution, Stats } from "./types";

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeStats(days: DayContribution[]): Stats {
  const empty: Stats = {
    total: 0,
    currentStreak: 0,
    longestStreak: 0,
    bestDay: { date: "", count: 0 },
    dailyAverage: 0,
  };

  if (days.length === 0) return empty;

  const total = days.reduce((s, d) => s + d.count, 0);
  const bestDay = days.reduce((best, d) => (d.count > best.count ? d : best));

  let longestStreak = 0;
  let run = 0;
  for (const d of days) {
    if (d.count > 0) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 0;
    }
  }

  const activeDates = new Set(days.filter((d) => d.count > 0).map((d) => d.date));
  let currentStreak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!activeDates.has(formatDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activeDates.has(formatDate(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const spanDays =
    (new Date(days[days.length - 1].date + "T00:00:00").getTime() -
      new Date(days[0].date + "T00:00:00").getTime()) /
      86_400_000 +
    1;
  const dailyAverage = spanDays > 0 ? total / spanDays : 0;

  return { total, currentStreak, longestStreak, bestDay, dailyAverage };
}
