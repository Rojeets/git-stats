import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: { user: string } }
) {
  const { user } = params;

  try {
    const response = await fetch(
      `https://github.com/users/${encodeURIComponent(user)}/contributions`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; GitProductivityHeatmap/1.0)",
          Accept: "text/html",
        },
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        { error: `GitHub user "${user}" not found` },
        { status: 404 }
      );
    }

    if (response.status === 429 || response.status === 403) {
      const reset = response.headers.get("X-RateLimit-Reset");
      const when = reset
        ? ` Try again after ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`
        : "";
      return NextResponse.json(
        { error: `GitHub rate limit exceeded.${when}` },
        { status: 429 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub returned status ${response.status}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const days: { date: string; count: number }[] = [];

    // NOTE: GitHub's contributions page is an *undocumented* HTML fragment.
    // The structure below (data-date on <td>, count in <tool-tip>) was observed
    // as of mid-2025. GitHub may change this markup at any time without notice,
    // which would break parsing. If the heatmap stops populating, inspect the
    // live HTML at https://github.com/users/{name}/contributions and update the
    // regexes accordingly.
    const cellRe =
      /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="\d+"[^>]*>[\s\S]*?<tool-tip[^>]*>([\s\S]*?)<\/tool-tip>/g;

    let m: RegExpExecArray | null;
    while ((m = cellRe.exec(html)) !== null) {
      const date = m[1];
      const tip = m[2].trim();
      let count = 0;
      if (tip !== "No contributions.") {
        const cm = tip.match(/(\d+)\s+contributions?/);
        if (cm) count = parseInt(cm[1], 10);
      }
      days.push({ date, count });
    }

    return NextResponse.json(
      { days },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub contributions" },
      { status: 500 }
    );
  }
}
