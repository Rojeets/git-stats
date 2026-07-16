"use client";

import { Stats } from "@/lib/types";

interface StatsSummaryProps {
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
      className="border rounded-lg p-3 sm:p-4"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="text-sm mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </div>
      <div
        className="text-xl font-semibold truncate"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <Card
        label="Total Contributions"
        value={stats.total.toLocaleString()}
      />
      <Card
        label="Daily Average"
        value={stats.dailyAverage.toFixed(1)}
      />
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
