"use client";

import { useState, useEffect, useCallback } from "react";
import UsernameForm from "@/components/UsernameForm";
import Heatmap from "@/components/Heatmap";
import StatsSummary from "@/components/StatsSummary";
import LanguageChart from "@/components/LanguageChart";
import CSVExport from "@/components/CSVExport";
import ShareButton from "@/components/ShareButton";
import ThemeToggle from "@/components/ThemeToggle";
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

function pushParams(github: string, gitlab: string) {
  const sp = new URLSearchParams();
  if (github) sp.set("github", github);
  if (gitlab) sp.set("gitlab", gitlab);
  const qs = sp.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

export default function Home() {
  const [days, setDays] = useState<DayContribution[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [initGithub, setInitGithub] = useState("");
  const [initGitlab, setInitGitlab] = useState("");
  const [ready, setReady] = useState(false);

  // Read URL params on mount and trigger auto-fetch
  useEffect(() => {
    const { github, gitlab } = getParams();
    setInitGithub(github);
    setInitGitlab(gitlab);
    setReady(true);
    if (github || gitlab) {
      handleSubmit(github, gitlab);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(async (github: string, gitlab: string) => {
    setLoading(true);
    setErrors([]);
    pushParams(github, gitlab);

    const calJobs: Promise<{ platform: string; data: CalOk | ApiErr }>[] = [];
    const langJobs: Promise<{ platform: string; data: LangOk | ApiErr }>[] =
      [];

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
  }, []);

  if (!ready) return null;

  return (
    <main className="min-h-screen py-6 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Git Productivity Heatmap
            </h1>
            <p className="text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Enter a GitHub or GitLab username to visualize their public
              contributions.
            </p>
          </div>
          <div className="shrink-0 mt-0.5">
            <ThemeToggle />
          </div>
        </header>

        <UsernameForm
          onSubmit={handleSubmit}
          loading={loading}
          initialGithub={initGithub}
          initialGitlab={initGitlab}
        />

        {errors.length > 0 && (
          <div
            className="mt-4 px-4 py-3 border rounded-md text-sm space-y-1"
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
          <div className="mt-8">
            <StatsSummary stats={stats} />
          </div>
        )}

        {days.length > 0 && (
          <div
            className="mt-6 border rounded-lg p-4"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span />
              <div className="flex items-center gap-2">
                <ShareButton />
                <CSVExport days={days} />
              </div>
            </div>
            <Heatmap days={days} />
          </div>
        )}

        {Object.keys(languages).length > 0 && (
          <div className="mt-6">
            <LanguageChart languages={languages} />
          </div>
        )}

        <footer
          className="mt-12 text-center text-xs space-y-1"
          style={{ color: "var(--text-muted)" }}
        >
          <p>
            GitHub contribution data is parsed from an unofficial HTML fragment
            that may change without notice.
          </p>
          <p>
            GitLab data comes from the public{" "}
            <code style={{ color: "var(--text-secondary)" }}>calendar.json</code> endpoint.
          </p>
        </footer>
      </div>
    </main>
  );
}
