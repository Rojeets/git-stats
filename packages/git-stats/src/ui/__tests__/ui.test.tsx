import { renderToStaticMarkup } from "react-dom/server";
import { Heatmap } from "../Heatmap";
import { StatsSummary } from "../StatsSummary";
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

describe("Heatmap", () => {
  it("renders contribution cells as rects", () => {
    const html = renderToStaticMarkup(<Heatmap days={days} />);
    expect(html).toContain("<rect");
    expect(html).toContain("aria-label=\"Contribution heatmap\"");
  });

  it("renders empty state when no days", () => {
    const html = renderToStaticMarkup(<Heatmap days={[]} />);
    expect(html).toContain("No contribution data to display.");
  });

  it("uses provided colors", () => {
    const colors = ["#000", "#111", "#222", "#333", "#444"];
    const html = renderToStaticMarkup(<Heatmap days={days} colors={colors} />);
    expect(html).toContain("fill=\"#222\"");
    expect(html).not.toContain("fill=\"#128c3e\"");
  });
});

describe("StatsSummary", () => {
  it("renders all stat labels and values", () => {
    const html = renderToStaticMarkup(<StatsSummary stats={stats} />);
    expect(html).toContain("Total Contributions");
    expect(html).toContain("17");
    expect(html).toContain("Current Streak");
    expect(html).toContain("2 days");
    expect(html).toContain("Longest Streak");
    expect(html).toContain("Best Day");
    expect(html).toContain("12 on");
  });
});
