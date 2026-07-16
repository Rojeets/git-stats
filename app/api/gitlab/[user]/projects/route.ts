import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: { user: string } }
) {
  const { user } = params;

  try {
    // GitLab user projects endpoint requires the numeric user ID.
    const userRes = await fetch(
      `https://gitlab.com/api/v4/users?username=${encodeURIComponent(user)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GitProductivityHeatmap/1.0)",
        },
      }
    );

    if (userRes.status === 429) {
      const retry = userRes.headers.get("Retry-After");
      const when = retry ? ` Try again in ${retry} seconds.` : "";
      return NextResponse.json(
        { error: `GitLab rate limit exceeded.${when}` },
        { status: 429 }
      );
    }

    if (!userRes.ok) {
      const detail =
        userRes.status === 403
          ? `GitLab blocked the user lookup for "${user}". Verify the username exists and the profile is public.`
          : `GitLab user lookup failed (status ${userRes.status}). Try again later.`;
      return NextResponse.json(
        { error: detail },
        { status: userRes.status }
      );
    }

    const users: { id: number }[] = await userRes.json();
    if (users.length === 0) {
      return NextResponse.json(
        { error: `GitLab user "${user}" not found` },
        { status: 404 }
      );
    }

    const userId = users[0].id;

    const projRes = await fetch(
      `https://gitlab.com/api/v4/users/${userId}/projects?per_page=100&order_by=last_activity_at`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GitProductivityHeatmap/1.0)",
        },
      }
    );

    if (projRes.status === 429) {
      const retry = projRes.headers.get("Retry-After");
      const when = retry ? ` Try again in ${retry} seconds.` : "";
      return NextResponse.json(
        { error: `GitLab rate limit exceeded.${when}` },
        { status: 429 }
      );
    }

    if (!projRes.ok) {
      return NextResponse.json(
        { error: `GitLab projects API returned status ${projRes.status}` },
        { status: projRes.status }
      );
    }

    const projects: { languages_url?: string; language?: string | null }[] =
      await projRes.json();

    // Aggregate primary languages from project metadata.
    const langs: Record<string, number> = {};
    for (const p of projects) {
      const lang = p.language;
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
      { error: "Failed to fetch GitLab projects" },
      { status: 500 }
    );
  }
}
