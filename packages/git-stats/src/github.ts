import { DayContribution } from "./types";

export class GitStatsError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitStatsError";
    this.status = status;
  }
}

/**
 * Fetches the public contribution calendar for a GitHub user.
 *
 * NOTE: GitHub's contributions page is an *undocumented* HTML fragment.
 * The structure below (data-date on <td>, count in <tool-tip>) was observed
 * as of mid-2025. GitHub may change this markup at any time without notice,
 * which would break parsing.
 */
export async function fetchGithubContributions(
  username: string
): Promise<DayContribution[]> {
  const response = await fetch(
    `https://github.com/users/${encodeURIComponent(username)}/contributions`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GitProductivityHeatmap/1.0)",
        Accept: "text/html",
      },
    }
  );

  if (response.status === 404) {
    throw new GitStatsError(`GitHub user "${username}" not found`, 404);
  }

  if (response.status === 429 || response.status === 403) {
    const reset = response.headers.get("X-RateLimit-Reset");
    const when = reset
      ? ` Try again after ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`
      : "";
    throw new GitStatsError(`GitHub rate limit exceeded.${when}`, 429);
  }

  if (!response.ok) {
    throw new GitStatsError(
      `GitHub returned status ${response.status}`,
      response.status
    );
  }

  const html = await response.text();
  const days: DayContribution[] = [];

  const cellRe =
    /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="\d+"[^>]*>[\s\S]*?<tool-tip[^>]*>([\s\S]*?)<\/tool-tip>/g;

  let m: RegExpExecArray | null;
  while ((m = cellRe.exec(html)) !== null) {
    const date = m[1];
    const tip = m[2].trim();
    let count = 0;
    if (tip !== "No contributions.") {
      const cm = tip.match(/(\d+)\s+contributions?/);
      if (cm) count = parseInt(cm[1], 10);
    }
    days.push({ date, count });
  }

  return days;
}
