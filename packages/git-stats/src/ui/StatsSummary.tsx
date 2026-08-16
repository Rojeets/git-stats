import { Stats } from "../types";

export interface StatsSummaryProps {
  stats: Stats;
}

function fmtDate(s: string): string {
  if (!s) return "N/A";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--gs-border, #d0d7de)",
        borderRadius: 8,
        padding: "0.75rem 1rem",
        backgroundColor: "var(--gs-bg, #ffffff)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          marginBottom: "0.25rem",
          color: "var(--gs-text-secondary, #656d76)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "var(--gs-text, #1f2328)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      <Card label="Total Contributions" value={stats.total.toLocaleString()} />
      <Card label="Daily Average" value={stats.dailyAverage.toFixed(1)} />
      <Card
        label="Current Streak"
        value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`}
      />
      <Card
        label="Longest Streak"
        value={`${stats.longestStreak} day${stats.longestStreak !== 1 ? "s" : ""}`}
      />
      <Card
        label="Best Day"
        value={
          stats.bestDay.date
            ? `${stats.bestDay.count} on ${fmtDate(stats.bestDay.date)}`
            : "N/A"
        }
      />
    </div>
  );
}
