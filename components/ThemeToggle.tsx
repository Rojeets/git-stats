"use client";

import { useTheme } from "@/lib/theme-context";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="p-2 rounded-md border transition-colors"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-card)",
        color: "var(--text-secondary)",
      }}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 12a4 4 0 100-8 4 4 0 000 8zm0 1A5 5 0 118 3a5 5 0 010 10zm.5-10.5h-1v1h1v-1zm0 13h-1v1h1v-1zM3.5 8h-1v1h1V8zm11-4.5h-1v1h1v-1zm0 11h-1v1h1v-1zM1.5 4h1v1h-1V4zm11.5 9.5h1v1h-1v-1zM3.5 12h-1v1h1v-1zM12.5 3.5h1v1h-1v-1z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9.598 1.591a.749.749 0 01.785-.175 7.001 7.001 0 11-8.967 8.967.75.75 0 01.961-.96 5.5 5.5 0 007.046-7.046.75.75 0 01.175-.786z" />
        </svg>
      )}
    </button>
  );
}
