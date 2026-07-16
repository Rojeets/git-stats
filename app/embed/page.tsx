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
