import { DayContribution } from "./types";
import { GitStatsError } from "./github";

/**
 * Fetches the public contribution calendar for a GitLab user from the
 * public calendar.json endpoint, gap-filling inactive days with zeros
 * between the first and last active date.
 */
export async function fetchGitlabContributions(
  username: string
): Promise<DayContribution[]> {
  const response = await fetch(
    `https://gitlab.com/users/${encodeURIComponent(username)}/calendar.json`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GitProductivityHeatmap/1.0)",
        Accept: "application/json",
      },
    }
  );

  if (response.status === 404) {
    throw new GitStatsError(`GitLab user "${username}" not found`, 404);
  }

  if (response.status === 429) {
    const retry = response.headers.get("Retry-After");
    const when = retry ? ` Try again in ${retry} seconds.` : "";
    throw new GitStatsError(`GitLab rate limit exceeded.${when}`, 429);
  }

  if (response.status === 403) {
    throw new GitStatsError(
      `GitLab blocked this request. This usually happens because the username "${username}" doesn't exist, the profile is private, or GitLab is rate-limiting automated requests. Verify the username and try again.`,
      403
    );
  }

  if (!response.ok) {
    throw new GitStatsError(
      `GitLab returned an unexpected error (status ${response.status}). Try again later.`,
      response.status
    );
  }

  const calendar: Record<string, number> = await response.json();

  const active = Object.entries(calendar)
    .filter(([, count]) => typeof count === "number" && count > 0)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (active.length === 0) {
    return [];
  }

  const first = new Date(active[0].date + "T00:00:00");
  const last = new Date(active[active.length - 1].date + "T00:00:00");
  const activitySet = new Set(active.map((d) => d.date));

  const days: DayContribution[] = [];
  const cur = new Date(first);
  while (cur <= last) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    days.push({
      date: dateStr,
      count: activitySet.has(dateStr) ? (calendar[dateStr] as number) : 0,
    });
    cur.setDate(cur.getDate() + 1);
  }

  return days;
}
