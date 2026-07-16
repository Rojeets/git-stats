"use client";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Scala: "#c22d40",
  R: "#198CE7",
  Lua: "#000080",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Perl: "#0298c3",
  "Objective-C": "#438eff",
  Zig: "#ec915c",
  Nix: "#7e7eff",
};

const DEFAULT_COLOR = "#8b8b8b";

interface LanguageChartProps {
  languages: Record<string, number>;
}

export default function LanguageChart({ languages }: LanguageChartProps) {
  const entries = Object.entries(languages)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  const total = entries.reduce((s, [, c]) => s + c, 0);

  return (
    <div
      className="border rounded-lg p-3 sm:p-4"
      style={{ borderColor: "var(--border)" }}
    >
      <h2
        className="text-sm font-medium mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        Language Breakdown
      </h2>

      {/* Stacked bar */}
      <div
        className="flex h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {entries.map(([lang, count]) => {
          const pct = (count / total) * 100;
          return (
            <div
              key={lang}
              style={{
                width: `${pct}%`,
                backgroundColor: LANG_COLORS[lang] || DEFAULT_COLOR,
              }}
              className="h-full"
              title={`${lang}: ${count} repos (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {entries.map(([lang, count]) => {
          const pct = ((count / total) * 100).toFixed(1);
          return (
            <div key={lang} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: LANG_COLORS[lang] || DEFAULT_COLOR,
                }}
              />
              <span style={{ color: "var(--text-primary)" }}>{lang}</span>
              <span style={{ color: "var(--text-secondary)" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
