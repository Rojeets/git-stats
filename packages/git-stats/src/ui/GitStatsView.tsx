import { DayContribution, Stats } from "../types";
import { Heatmap } from "./Heatmap";
import { StatsSummary } from "./StatsSummary";
import { GithubIcon, GitlabIcon } from "./icons";

export interface GitStatsViewProps {
  days: DayContribution[];
  stats: Stats;
  /** GitHub username for profile link. Omit to hide GitHub link. */
  github?: string;
  /** GitLab username for profile link. Omit to hide GitLab link. */
  gitlab?: string;
  /** 5 intensity-level colors passed to Heatmap. */
  colors?: string[];
  /** Show GitHub/GitLab profile links beside the heatmap. Default true. */
  showProfiles?: boolean;
}

export function GitStatsView({
  days,
  stats,
  github,
  gitlab,
  colors,
  showProfiles = true,
}: GitStatsViewProps) {
  const profiles = [
    { href: github ? `https://github.com/${github}` : null, name: "GitHub", user: github, Icon: GithubIcon },
    { href: gitlab ? `https://gitlab.com/${gitlab}` : null, name: "GitLab", user: gitlab, Icon: GitlabIcon },
  ].filter((p) => showProfiles && p.href && p.user) as {
    href: string;
    name: string;
    user: string;
    Icon: typeof GithubIcon;
  }[];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <StatsSummary stats={stats} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 480px" }}>
            <Heatmap days={days} colors={colors} />
          </div>
          {profiles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                minWidth: 180,
              }}
            >
              {profiles.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: 8,
                    border: "1px solid var(--gs-border, #d0d7de)",
                    backgroundColor: "var(--gs-bg, #ffffff)",
                    color: "var(--gs-text, #1f2328)",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    minHeight: 44,
                  }}
                >
                  <p.Icon size={18} />
                  <span style={{ whiteSpace: "nowrap" }}>{p.name}</span>
                  <span
                    style={{
                      color: "var(--gs-text-secondary, #656d76)",
                      fontFamily: "monospace",
                      fontSize: 12,
                      fontWeight: 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.user}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
