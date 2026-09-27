# @rojeets/git-stats

Fetch public GitHub and GitLab contribution data and compute activity statistics — totals, current streak, longest streak, best day, and daily average. Works in Node.js 18+ (uses global `fetch`).

Also ships React components for rendering the data: `Heatmap`, `StatsSummary`, and ready-made `GitStats` / `GitStatsClient` widgets that fetch and render in one call.

## Install

```bash
npm install @rojeets/git-stats
```

Requires `react` and `react-dom` >= 17 (peer dependencies).

## Usage

```js
import { getStats } from "@rojeets/git-stats";

const result = await getStats({ github: "octocat", gitlab: "someuser" });

console.log(result.stats);
// {
//   total: 1234,
//   currentStreak: 5,
//   longestStreak: 42,
//   bestDay: { date: "2025-06-01", count: 87 },
//   dailyAverage: 3.4
// }
```

Pass one username or both. A missing platform is returned as `null` in the result and skipped in the merge:

```js
const { github, gitlab, merged, stats } = await getStats({ github: "octocat" });
```

## UI components

### `GitStats` — server component (recommended)

Fetches contribution data server-side and renders stats + heatmap + profile links in one call. Because the fetch runs on the server it is not blocked by CORS.

```tsx
import { GitStats } from "@rojeets/git-stats";

// In a Next.js App Router page / server component:
<GitStats github="octocat" gitlab="someuser" />
```

| Prop | Type | Description |
|------|------|-------------|
| `github` | `string?` | GitHub username (data + profile link). Omit to skip. |
| `gitlab` | `string?` | GitLab username (data + profile link). Omit to skip. |
| `colors` | `string[]` (5 levels) | Heatmap intensity colors. Defaults to GitHub green ramp. |
| `showProfiles` | `boolean` | Show GitHub/GitLab links beside the heatmap. Default `true`. |

### `GitStatsClient` — client component (with your own endpoint)

For client-rendered trees. The browser cannot call GitHub/GitLab directly (CORS), so you provide an endpoint that returns `{ days, stats }`:

```tsx
import { GitStatsClient } from "@rojeets/git-stats";

<GitStatsClient endpoint="/api/git-stats" github="octocat" />
```

Example server endpoint (Next.js route handler):

```ts
// app/api/git-stats/route.ts
import { NextResponse } from "next/server";
import { getStats } from "@rojeets/git-stats";

export async function GET() {
  const { merged, stats } = await getStats({ github: "octocat" });
  return NextResponse.json({ days: merged, stats });
}
```

| Prop | Type | Description |
|------|------|-------------|
| `endpoint` | `string` | Server route returning `{ days, stats }`. Required. |
| `github` / `gitlab` | `string?` | Usernames (profile links only — data comes from your endpoint). |
| `colors` | `string[]` (5 levels) | Heatmap intensity colors. |
| `showProfiles` | `boolean` | Show profile links. Default `true`. |

### `Heatmap({ days, colors? })` and `StatsSummary({ stats })`

Presentational building blocks, used internally by the widgets.

### Customization via CSS variables

Components are unstyled apart from layout geometry. Colors come from CSS variables with light-mode GitHub fallbacks:

| Variable | Used for | Default |
|----------|----------|---------|
| `--gs-text` | primary text | `#1f2328` |
| `--gs-text-secondary` | secondary text, empty-state text | `#656d76` |
| `--gs-bg` | card background | `#ffffff` |
| `--gs-border` | card border | `#d0d7de` |
| `--gs-label` | heatmap month/weekday labels | `#656d76` |

Override at any scope (root, a wrapper, or inline via `style`) to adapt to dark themes.

## API

### `getStats({ github?, gitlab? }) → Promise<GetStatsResult>`

Fetches both calendars concurrently, merges them (summing counts on overlapping dates), and computes stats over the merged calendar.

Result:

| Field | Type | Description |
|-------|------|-------------|
| `github` | `DayContribution[] \| null` | GitHub calendar, or `null` if not requested |
| `gitlab` | `DayContribution[] \| null` | GitLab calendar, or `null` if not requested |
| `merged` | `DayContribution[]` | Both calendars merged, sorted by date |
| `stats` | `Stats` | Statistics computed over `merged` |

### `fetchGithubContributions(username) → Promise<DayContribution[]>`

Fetches the raw GitHub contribution calendar for a user.

### `fetchGitlabContributions(username) → Promise<DayContribution[]>`

Fetches the raw GitLab contribution calendar for a user, gap-filling inactive days with zero between the first and last active date.

### `computeStats(days) → Stats`

Computes `total`, `currentStreak`, `longestStreak`, `bestDay`, `dailyAverage` from a `DayContribution[]`.

### `mergeCalendars(...calendars) → DayContribution[]`

Merges multiple calendars, summing counts on overlapping dates, sorted ascending.

### Types

```ts
interface DayContribution {
  date: string; // "YYYY-MM-DD"
  count: number;
}

interface Stats {
  total: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: DayContribution;
  dailyAverage: number;
}
```

## Errors

All fetch errors throw `GitStatsError` (an `Error` subclass) with a `status` property:

- `404` — user not found
- `429` — rate limited
- `403` — GitLab blocked the request (private profile, non-existent user, or rate limiting)
- other — unexpected upstream error

```js
import { GitStatsError } from "@rojeets/git-stats";

try {
  await getStats({ github: "does-not-exist-12345" });
} catch (err) {
  if (err instanceof GitStatsError) console.log(err.status, err.message);
}
```

## Caveat

The GitHub contributions page is an **unofficial and undocumented** HTML fragment. The parser relies on `data-date` attributes on `<td>` elements and `<tool-tip>` elements containing the contribution count. GitHub may change this markup at any time, which would break parsing. Same applies to GitLab's public `calendar.json` endpoint.

## License

MIT
