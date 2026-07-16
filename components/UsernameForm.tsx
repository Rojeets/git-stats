"use client";

import { useState, FormEvent, useEffect } from "react";

interface UsernameFormProps {
  onSubmit: (github: string, gitlab: string) => void;
  loading: boolean;
  initialGithub?: string;
  initialGitlab?: string;
}

export default function UsernameForm({
  onSubmit,
  loading,
  initialGithub = "",
  initialGitlab = "",
}: UsernameFormProps) {
  const [github, setGithub] = useState(initialGithub);
  const [gitlab, setGitlab] = useState(initialGitlab);

  useEffect(() => {
    setGithub(initialGithub);
  }, [initialGithub]);

  useEffect(() => {
    setGitlab(initialGitlab);
  }, [initialGitlab]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (github.trim() || gitlab.trim()) {
      onSubmit(github.trim(), gitlab.trim());
    }
  };

  const disabled = loading || (!github.trim() && !gitlab.trim());

  const inputClass =
    "px-3 py-2 border rounded-md focus:outline-none focus:ring-1";

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--input-bg)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
    // @ts-expect-error CSS custom properties work in style
    "--tw-ring-color": "var(--accent)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-col gap-1.5 flex-1">
        <label
          htmlFor="github"
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          GitHub Username
        </label>
        <input
          id="github"
          type="text"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          placeholder="e.g. torvalds"
          className={`${inputClass} placeholder:opacity-50`}
          style={inputStyle}
        />
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <label
          htmlFor="gitlab"
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          GitLab Username
        </label>
        <input
          id="gitlab"
          type="text"
          value={gitlab}
          onChange={(e) => setGitlab(e.target.value)}
          placeholder="e.g. torvalds"
          className={`${inputClass} placeholder:opacity-50`}
          style={inputStyle}
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="w-full sm:w-auto px-6 py-2 text-white font-medium rounded-md transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          backgroundColor: disabled ? "var(--green-disabled)" : "var(--green)",
          color: disabled ? "var(--text-muted)" : "#fff",
        }}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading…
          </>
        ) : (
          "Show Heatmap"
        )}
      </button>
    </form>
  );
}
