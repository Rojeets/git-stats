"use client";

import { DayContribution } from "@/lib/types";

interface CSVExportProps {
  days: DayContribution[];
}

export default function CSVExport({ days }: CSVExportProps) {
  const download = () => {
    const header = "date,count\n";
    const rows = days.map((d) => `${d.date},${d.count}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contributions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
      style={{
        borderColor: "var(--border)",
        color: "var(--text-secondary)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.5 13h9a.5.5 0 010 1h-9a.5.5 0 010-1zM8 1v10.5a.5.5 0 01-1 0V1.707L4.354 4.354a.5.5 0 11-.708-.708l3-3a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8 1.707V1z" />
      </svg>
      Export CSV
    </button>
  );
}
