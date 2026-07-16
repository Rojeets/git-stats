"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select from a temporary input
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
      style={{
        borderColor: "var(--border)",
        color: copied ? "var(--green)" : "var(--text-secondary)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.75 3a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75h6.5a.75.75 0 00.75-.75v-.5a.75.75 0 00-.75-.75h-6.5zM3 6.75A.75.75 0 013.75 6h8.5a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75h-8.5A.75.75 0 013 12.25v-5.5zM3.75 3A2.25 2.25 0 001.5 5.25v5.5A2.25 2.25 0 003.75 13h8.5A2.25 2.25 0 0014.5 10.75v-5.5A2.25 2.25 0 0012.25 3h-8.5z" />
        </svg>
      )}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
