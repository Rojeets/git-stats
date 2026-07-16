"use client";

import { DayContribution } from "@/lib/types";

interface HeatmapProps {
  days: DayContribution[];
}

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LABEL_X = 28;
const LABEL_Y = 16;

const LEVELS = ["#161b22", "#0a3d20", "#128c3e", "#2dd85e", "#44f278"];

function level(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  const r = count / max;
  if (r <= 0.25) return 1;
  if (r <= 0.5) return 2;
  if (r <= 0.75) return 3;
  return 4;
}

function key(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function prettyDate(s: string): string {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Heatmap({ days }: HeatmapProps) {
  if (days.length === 0) {
    return (
      <p
        className="text-center py-8"
        style={{ color: "var(--text-muted)" }}
      >
        No contribution data to display.
      </p>
    );
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const map = new Map(days.map((d) => [d.date, d.count]));

  const sorted = days.map((d) => d.date).sort();
  const first = new Date(sorted[0] + "T00:00:00");
  const last = new Date(sorted[sorted.length - 1] + "T00:00:00");

  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(last);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const weeks: Map<
    number,
    { ds: string; count: number; lv: number }
  >[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    const dow = cur.getDay();
    if (dow === 0) weeks.push(new Map());
    const w = weeks[weeks.length - 1];
    const ds = key(cur);
    const c = map.get(ds) ?? 0;
    w.set(dow, { ds, count: c, lv: level(c, maxCount) });
    cur.setDate(cur.getDate() + 1);
  }

  const monthLabels: { text: string; col: number }[] = [];
  let prevM = -1;
  for (let i = 0; i < weeks.length; i++) {
    const sun = weeks[i].get(0);
    if (!sun) continue;
    const [, m] = sun.ds.split("-").map(Number);
    const mi = m - 1;
    if (mi !== prevM) {
      prevM = mi;
      const label = new Date(2024, mi, 1).toLocaleDateString("en-US", {
        month: "short",
      });
      monthLabels.push({ text: label, col: i });
    }
  }

  const w = LABEL_X + weeks.length * STEP;
  const h = LABEL_Y + 7 * STEP;

  const dows = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <svg
        width={w}
        height={h}
        className="block min-w-[300px]"
        role="img"
        aria-label="Contribution heatmap"
      >
        {monthLabels.map((ml, i) => (
          <text
            key={i}
            x={LABEL_X + ml.col * STEP}
            y={11}
            className="heatmap-label"
            fontSize={10}
            fontFamily="sans-serif"
          >
            {ml.text}
          </text>
        ))}

        {dows.map((l, i) =>
          l ? (
            <text
              key={i}
              x={0}
              y={LABEL_Y + i * STEP + CELL - 2}
              className="heatmap-label"
              fontSize={10}
              fontFamily="sans-serif"
            >
              {l}
            </text>
          ) : null
        )}

        {weeks.map((week, wi) =>
          Array.from({ length: 7 }, (_, di) => {
            const d = week.get(di);
            if (!d) return null;
            return (
              <rect
                key={d.ds}
                x={LABEL_X + wi * STEP}
                y={LABEL_Y + di * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                ry={2}
                fill={LEVELS[d.lv]}
              >
                <title>
                  {d.count} contribution{d.count !== 1 ? "s" : ""} on{" "}
                  {prettyDate(d.ds)}
                </title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}
