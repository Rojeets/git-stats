import { computeStats } from "../computeStats";

// Helper to build date strings for a range
function days(start: string, end: string): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const cur = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (cur <= last) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    result.push({ date: `${y}-${m}-${d}`, count: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("computeStats", () => {
  it("returns zeros for empty input", () => {
    const result = computeStats([]);
    expect(result).toEqual({
      total: 0,
      currentStreak: 0,
      longestStreak: 0,
      bestDay: { date: "", count: 0 },
      dailyAverage: 0,
    });
  });

  it("computes total correctly", () => {
    const result = computeStats([
      { date: "2025-01-01", count: 5 },
      { date: "2025-01-02", count: 3 },
      { date: "2025-01-03", count: 7 },
    ]);
    expect(result.total).toBe(15);
  });

  it("finds best day", () => {
    const result = computeStats([
      { date: "2025-01-01", count: 5 },
      { date: "2025-01-02", count: 12 },
      { date: "2025-01-03", count: 3 },
    ]);
    expect(result.bestDay).toEqual({ date: "2025-01-02", count: 12 });
  });

  it("computes longest streak across a contiguous run", () => {
    const result = computeStats([
      { date: "2025-01-01", count: 1 },
      { date: "2025-01-02", count: 1 },
      { date: "2025-01-03", count: 0 },
      { date: "2025-01-04", count: 1 },
      { date: "2025-01-05", count: 1 },
      { date: "2025-01-06", count: 1 },
    ]);
    expect(result.longestStreak).toBe(3);
  });

  it("computes longest streak of 1 when all days are isolated", () => {
    const result = computeStats([
      { date: "2025-01-01", count: 1 },
      { date: "2025-01-02", count: 0 },
      { date: "2025-01-03", count: 1 },
    ]);
    expect(result.longestStreak).toBe(1);
  });

  it("computes current streak ending at today", () => {
    const t = today();
    const result = computeStats([
      { date: "2025-01-01", count: 1 },
      { date: t, count: 5 },
    ]);
    expect(result.currentStreak).toBeGreaterThanOrEqual(1);
  });

  it("computes current streak starting from yesterday if today is empty", () => {
    const y = dateOffset(-1);
    const result = computeStats([
      { date: "2025-01-01", count: 1 },
      { date: y, count: 3 },
    ]);
    expect(result.currentStreak).toBeGreaterThanOrEqual(1);
  });

  it("current streak is 0 when no recent activity", () => {
    const result = computeStats([{ date: "2020-01-01", count: 5 }]);
    expect(result.currentStreak).toBe(0);
  });

  it("computes daily average over the span", () => {
    const result = computeStats([
      { date: "2025-01-01", count: 10 },
      { date: "2025-01-04", count: 10 },
    ]);
    // span = Jan 1 to Jan 4 = 4 days, total = 20
    expect(result.dailyAverage).toBeCloseTo(5.0);
  });

  it("breaks longest streak correctly on sparse data (GitLab-style gaps)", () => {
    // Simulates data after gap-fill: active days interleaved with zero-count gaps
    const result = computeStats([
      { date: "2025-06-01", count: 5 },
      { date: "2025-06-02", count: 3 },
      { date: "2025-06-03", count: 2 },
      { date: "2025-06-04", count: 0 },
      { date: "2025-06-05", count: 0 },
      { date: "2025-06-06", count: 7 },
      { date: "2025-06-07", count: 1 },
      { date: "2025-06-08", count: 4 },
      { date: "2025-06-09", count: 0 },
      { date: "2025-06-10", count: 2 },
    ]);
    expect(result.longestStreak).toBe(3);
    expect(result.total).toBe(24);
  });
});
