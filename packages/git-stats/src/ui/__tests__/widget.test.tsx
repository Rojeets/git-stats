import { renderToStaticMarkup } from "react-dom/server";
import { GitStatsView } from "../GitStatsView";
import { GitStatsClient } from "../GitStatsClient";
import { DayContribution, Stats } from "../../types";

const days: DayContribution[] = [
  { date: "2025-01-01", count: 5 },
  { date: "2025-01-02", count: 0 },
  { date: "2025-01-03", count: 12 },
];

const stats: Stats = {
  total: 17,
  currentStreak: 2,
  longestStreak: 3,
  bestDay: { date: "2025-01-03", count: 12 },
  dailyAverage: 5.7,
};

describe("GitStatsView", () => {
  it("renders stats, heatmap, and profile links", () => {
    const html = renderToStaticMarkup(
      <GitStatsView
        days={days}
        stats={stats}
        github="octocat"
        gitlab="gitlabuser"
      />
    );
    expect(html).toContain("Total Contributions");
    expect(html).toContain("<rect");
    expect(html).toContain("github.com/octocat");
    expect(html).toContain("gitlab.com/gitlabuser");
    expect(html).toContain("GitHub");
    expect(html).toContain("GitLab");
  });

  it("hides profile links when showProfiles is false", () => {
    const html = renderToStaticMarkup(
      <GitStatsView
        days={days}
        stats={stats}
        github="octocat"
        showProfiles={false}
      />
    );
    expect(html).not.toContain("github.com/octocat");
  });

  it("omits link for missing username", () => {
    const html = renderToStaticMarkup(
      <GitStatsView days={days} stats={stats} github="octocat" />
    );
    expect(html).toContain("github.com/octocat");
    expect(html).not.toContain("gitlab.com/");
  });
});

describe("GitStatsClient", () => {
  it("renders loading state on first render", () => {
    const html = renderToStaticMarkup(
      <GitStatsClient endpoint="/api/stats" github="octocat" />
    );
    expect(html).toContain("Loading contribution data");
  });

  it("renders loading before endpoint data arrives", () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ days, stats }),
    } as Response);
    const html = renderToStaticMarkup(
      <GitStatsClient endpoint="/api/stats" github="octocat" />
    );
    // Effects don't run during server-side static render, so this stays loading.
    expect(html).toContain("Loading contribution data");
  });
});
