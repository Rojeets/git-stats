"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Heatmap from "@/components/Heatmap";
import StatsSummary from "@/components/StatsSummary";
import LanguageChart from "@/components/LanguageChart";
import { DayContribution, Stats } from "@/lib/types";
import { mergeCalendars } from "@/lib/mergeCalendars";
import { computeStats } from "@/lib/computeStats";

type CalOk = { days: DayContribution[] };
type LangOk = { languages: Record<string, number> };
type ApiErr = { error: string };

async function safeFetch<T>(path: string): Promise<T | ApiErr> {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch {
    return { error: "Network error" };
  }
}

function getParams() {
  if (typeof window === "undefined") return { github: "", gitlab: "" };
  const sp = new URLSearchParams(window.location.search);
  return {
    github: sp.get("github") || "",
    gitlab: sp.get("gitlab") || "",
  };
}

export default function EmbedPage() {
  const [days, setDays] = useState<DayContribution[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [githubUser, setGithubUser] = useState("");
  const [gitlabUser, setGitlabUser] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async (github: string, gitlab: string) => {
    setLoading(true);
    setErrors([]);

    const calJobs: Promise<{ platform: string; data: CalOk | ApiErr }>[] = [];
    const langJobs: Promise<{ platform: string; data: LangOk | ApiErr }>[] = [];

    if (github) {
      const enc = encodeURIComponent(github);
      calJobs.push(
        safeFetch<CalOk>(`/api/github/${enc}`).then((data) => ({
          platform: "GitHub",
          data,
        }))
      );
      langJobs.push(
        safeFetch<LangOk>(`/api/github/${enc}/repos`).then((data) => ({
          platform: "GitHub",
          data,
        }))
      );
    }

    if (gitlab) {
      const enc = encodeURIComponent(gitlab);
      calJobs.push(
        safeFetch<CalOk>(`/api/gitlab/${enc}`).then((data) => ({
          platform: "GitLab",
          data,
        }))
      );
      langJobs.push(
        safeFetch<LangOk>(`/api/gitlab/${enc}/projects`).then((data) => ({
          platform: "GitLab",
          data,
        }))
      );
    }

    const [calResults, langResults] = await Promise.all([
      Promise.all(calJobs),
      Promise.all(langJobs),
    ]);

    const calArrays: DayContribution[][] = [];
    const errs: string[] = [];

    for (const r of calResults) {
      if ("error" in r.data) {
        errs.push(`${r.platform}: ${r.data.error}`);
      } else {
        calArrays.push(r.data.days);
      }
    }

    if (calArrays.length > 0) {
      const merged = mergeCalendars(...calArrays);
      setDays(merged);
      setStats(computeStats(merged));
    } else {
      setDays([]);
      setStats(null);
    }

    const mergedLangs: Record<string, number> = {};
    for (const r of langResults) {
      if (!("error" in r.data)) {
        for (const [lang, count] of Object.entries(r.data.languages)) {
          mergedLangs[lang] = (mergedLangs[lang] || 0) + count;
        }
      }
    }
    setLanguages(mergedLangs);

    setErrors(errs);
    setLoading(false);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const { github, gitlab } = getParams();
    setGithubUser(github);
    setGitlabUser(gitlab);
    if (github || gitlab) {
      handleSubmit(github, gitlab);
    } else {
      setLoaded(true);
    }
  }, [handleSubmit]);

  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.contentRect.height);
        window.parent?.postMessage({ type: "embed-height", height }, "*");
      }
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <div
      ref={rootRef}
      className="py-4 px-3 sm:px-4"
      style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}
    >
      <div className="max-w-5xl mx-auto">
        <header className="mb-4 sm:mb-6">
          <h1
            className="text-lg sm:text-xl font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Git Productivity Heatmap
          </h1>
          <p
            className="text-xs sm:text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Public contribution activity from GitHub and/or GitLab.
          </p>
        </header>

        {(githubUser || gitlabUser) && (
          <div className="flex gap-2 mb-4">
            {githubUser && (
              <a
                href={`https://github.com/${githubUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View on GitHub
              </a>
            )}
            {gitlabUser && (
              <a
                href={`https://gitlab.com/${gitlabUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M15.95 9.47l-1.42-4.37a.75.75 0 00-.72-.51H8.36l1.37 4.22h5.22zM6.55 9.47L5.13 5.1a.75.75 0 00-.72-.51H.75l6.37 12.63L14.25 5.1h-5.17L7.55 9.47zM8 14.25L4.75 5.1h-3l6.25 12.63L14.25 5.1h-3L8 14.25z" />
                </svg>
                View on GitLab
              </a>
            )}
          </div>
        )}

        {loading && (
          <div
            className="text-center py-6 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Loading contributions…
          </div>
        )}

        {errors.length > 0 && (
          <div
            className="mb-4 px-3 py-2 border rounded-md text-xs space-y-1"
            style={{
              backgroundColor: "var(--error-bg)",
              borderColor: "var(--error-border)",
              color: "var(--error-text)",
            }}
          >
            {errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}

        {stats && (
          <div className="mb-4">
            <StatsSummary stats={stats} />
          </div>
        )}

        {days.length > 0 && (
          <div
            className="border rounded-lg p-3 sm:p-4"
            style={{ borderColor: "var(--border)" }}
          >
            <Heatmap days={days} />
          </div>
        )}

        {Object.keys(languages).length > 0 && (
          <div className="mt-4">
            <LanguageChart languages={languages} />
          </div>
        )}

        {!loading && loaded && !stats && errors.length === 0 && (
          <p
            className="text-center py-6 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            No data to display. Provide a username via{" "}
            <code style={{ color: "var(--text-secondary)" }}>
              ?github=username
            </code>{" "}
            or{" "}
            <code style={{ color: "var(--text-secondary)" }}>
              ?gitlab=username
            </code>
            .
          </p>
        )}

        <footer
          className="mt-6 text-center text-xs space-y-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          <p>
            GitHub contribution data is parsed from an unofficial HTML fragment.
          </p>
          <p>
            GitLab data comes from the public{" "}
            <code style={{ color: "var(--text-secondary)" }}>
              calendar.json
            </code>{" "}
            endpoint.
          </p>
        </footer>
      </div>
    </div>
  );
}
