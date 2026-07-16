import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: { user: string } }
) {
  const { user } = params;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GitProductivityHeatmap/1.0)",
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (res.status === 404) {
      return NextResponse.json(
        { error: `GitHub user "${user}" not found` },
        { status: 404 }
      );
    }

    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get("X-RateLimit-Remaining") === "0"
        ? res.headers.get("X-RateLimit-Reset")
        : null;
      const when = reset
        ? ` Try again after ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`
        : "";
      return NextResponse.json(
        { error: `GitHub API rate limit exceeded.${when}` },
        { status: 429 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub API returned status ${res.status}` },
        { status: res.status }
      );
    }

    const repos: { language: string | null }[] = await res.json();

    const langs: Record<string, number> = {};
    for (const repo of repos) {
      const lang = repo.language;
      if (lang) {
        langs[lang] = (langs[lang] || 0) + 1;
      }
    }

    return NextResponse.json(
      { languages: langs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub repos" },
      { status: 500 }
    );
  }
}
