"use client";

import { useEffect, useState } from "react";
import { DayContribution, Stats } from "../types";
import { GitStatsView } from "./GitStatsView";

export interface GitStatsClientProps {
  /** URL of a server route that returns { days, stats }. Required. */
  endpoint: string;
  /** GitHub username for profile link. Omit to hide GitHub link. */
  github?: string;
  /** GitLab username for profile link. Omit to hide GitLab link. */
  gitlab?: string;
  /** 5 intensity-level colors passed to Heatmap. */
  colors?: string[];
  /** Show GitHub/GitLab profile links beside the heatmap. Default true. */
  showProfiles?: boolean;
}

interface StatsPayload {
  days: DayContribution[];
  stats: Stats;
  error?: string;
}

export function GitStatsClient({
  endpoint,
  github,
  gitlab,
  colors,
  showProfiles,
}: GitStatsClientProps) {
  const [payload, setPayload] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint)
      .then((res) => res.json())
      .then((json: StatsPayload) => {
        if (cancelled) return;
        if (json.error) setError(json.error);
        else setPayload(json);
      })
      .catch(() => {
        if (!cancelled) setError("Network error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (loading) {
    return (
      <p
        style={{
          textAlign: "center",
          padding: "2rem 0",
          color: "var(--gs-text-secondary, #656d76)",
        }}
      >
        Loading contribution data…
      </p>
    );
  }

  if (error || !payload) {
    return (
      <p
        style={{
          textAlign: "center",
          padding: "2rem 0",
          color: "var(--gs-text-secondary, #656d76)",
        }}
      >
        Could not load contribution data. {error}
      </p>
    );
  }

  return (
    <GitStatsView
      days={payload.days}
      stats={payload.stats}
      github={github}
      gitlab={gitlab}
      colors={colors}
      showProfiles={showProfiles}
    />
  );
}
