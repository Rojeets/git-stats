import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: { user: string } }
) {
  const { user } = params;

  try {
    const response = await fetch(
      `https://gitlab.com/users/${encodeURIComponent(user)}/calendar.json`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; GitProductivityHeatmap/1.0)",
          Accept: "application/json",
        },
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        { error: `GitLab user "${user}" not found` },
        { status: 404 }
      );
    }

    if (response.status === 429) {
      const retry = response.headers.get("Retry-After");
      const when = retry ? ` Try again in ${retry} seconds.` : "";
      return NextResponse.json(
        { error: `GitLab rate limit exceeded.${when}` },
        { status: 429 }
      );
    }

    if (response.status === 403) {
      return NextResponse.json(
        {
          error: `GitLab blocked this request. This usually happens because the username "${user}" doesn't exist, the profile is private, or GitLab is rate-limiting automated requests. Verify the username and try again.`,
        },
        { status: 403 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitLab returned an unexpected error (status ${response.status}). Try again later.` },
        { status: response.status }
      );
    }

    const calendar: Record<string, number> = await response.json();

    const active = Object.entries(calendar)
      .filter(([, count]) => typeof count === "number" && count > 0)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (active.length === 0) {
      return NextResponse.json(
        { days: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const first = new Date(active[0].date + "T00:00:00");
    const last = new Date(active[active.length - 1].date + "T00:00:00");
    const activitySet = new Set(active.map((d) => d.date));

    const days: { date: string; count: number }[] = [];
    const cur = new Date(first);
    while (cur <= last) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      days.push({ date: dateStr, count: activitySet.has(dateStr) ? (calendar[dateStr] as number) : 0 });
      cur.setDate(cur.getDate() + 1);
    }

    return NextResponse.json(
      { days },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitLab contributions" },
      { status: 500 }
    );
  }
}
