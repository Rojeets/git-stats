# @rojeets/git-stats

Fetch public GitHub and GitLab contribution data and compute activity statistics — totals, current streak, longest streak, best day, and daily average. Works in Node.js 18+ (uses global `fetch`).

## Install

```bash
npm install @rojeets/git-stats
```

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
