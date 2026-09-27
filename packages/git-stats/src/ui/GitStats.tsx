import { getStats } from "../getStats";
import { GitStatsError } from "../github";
import { GitStatsView } from "./GitStatsView";

export interface GitStatsProps {
  /** GitHub username. Omit to skip GitHub data. */
  github?: string;
  /** GitLab username. Omit to skip GitLab data. */
  gitlab?: string;
  /** 5 intensity-level colors passed to Heatmap. */
  colors?: string[];
  /** Show GitHub/GitLab profile links beside the heatmap. Default true. */
  showProfiles?: boolean;
}

/**
 * Server component that fetches contribution data server-side and renders
 * stats + heatmap. Not blocked by CORS because the fetch runs on the server.
 */
export async function GitStats({
  github,
  gitlab,
  colors,
  showProfiles,
}: GitStatsProps) {
  let result;
  try {
    result = await getStats({ github, gitlab });
  } catch (err) {
    const message =
      err instanceof GitStatsError
        ? err.message
        : "Could not load contribution data.";
    return (
      <p
        style={{
          textAlign: "center",
          padding: "2rem 0",
          color: "var(--gs-text-secondary, #656d76)",
        }}
      >
        {message}
      </p>
    );
  }

  return (
    <GitStatsView
      days={result.merged}
      stats={result.stats}
      github={github}
      gitlab={gitlab}
      colors={colors}
      showProfiles={showProfiles}
    />
  );
}
