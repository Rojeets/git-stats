import { DayContribution, Stats } from "./types";
import { computeStats } from "./computeStats";
import { mergeCalendars } from "./mergeCalendars";
import { fetchGithubContributions } from "./github";
import { fetchGitlabContributions } from "./gitlab";

export interface GetStatsOptions {
  /** GitHub username. Omit to skip GitHub data. */
  github?: string;
  /** GitLab username. Omit to skip GitLab data. */
  gitlab?: string;
}

export interface GetStatsResult {
  /** GitHub calendar, or null when no GitHub username was given. */
  github: DayContribution[] | null;
  /** GitLab calendar, or null when no GitLab username was given. */
  gitlab: DayContribution[] | null;
  /** Both calendars merged, summing counts on overlapping dates. */
  merged: DayContribution[];
  /** Stats computed over the merged calendar. */
  stats: Stats;
}

/**
 * Fetches contribution calendars for the given GitHub and/or GitLab
 * usernames, merges them, and computes activity statistics.
 *
 * NOTE: fetches upstream servers directly and is blocked by CORS in the
 * browser. Call it server-side (route handler, server component, etc.).
 */
export async function getStats(
  options: GetStatsOptions
): Promise<GetStatsResult> {
  const [github, gitlab] = await Promise.all([
    options.github
      ? fetchGithubContributions(options.github)
      : Promise.resolve(null),
    options.gitlab
      ? fetchGitlabContributions(options.gitlab)
      : Promise.resolve(null),
  ]);

  const calendars: DayContribution[][] = [];
  if (github) calendars.push(github);
  if (gitlab) calendars.push(gitlab);

  const merged = mergeCalendars(...calendars);

  return { github, gitlab, merged, stats: computeStats(merged) };
}
