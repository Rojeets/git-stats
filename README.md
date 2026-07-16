# Git Productivity Heatmap

A single-page Next.js app that visualizes public GitHub and GitLab contribution activity in a GitHub-style heatmap with summary statistics.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Enter a GitHub username, a GitLab username, or both, and the app fetches their public contribution data and renders:

- A color-coded contribution heatmap (5 intensity levels)
- Total contributions
- Current streak (consecutive active days ending today or yesterday)
- Longest streak
- Best single day

## How It Works

- **GitHub** data is fetched server-side through a Next.js Edge route handler that proxies the undocumented HTML fragment at `https://github.com/users/{username}/contributions`. The HTML is parsed with regex to extract date/count pairs.
- **GitLab** data is fetched from the public `https://gitlab.com/users/{username}/calendar.json` endpoint, also proxied through a route handler for consistent error handling.
- All merging of calendars (summing counts on overlapping dates) and stat computation happens **client-side** in the browser.
- Both API routes are stateless: fetch, transform, return. No database, no caching beyond standard HTTP `s-maxage`.

## Important Caveat

The GitHub contributions HTML is **unofficial and undocumented**. GitHub may change the markup structure at any time without notice. The parsing logic in `app/api/github/[user]/route.ts` relies on `data-date` attributes on `<td>` elements and `<tool-tip>` elements containing the contribution count. If the heatmap stops populating for GitHub, inspect the live HTML and update the regexes accordingly.

## Tech Stack

- Next.js 14 (App Router) with Edge runtime route handlers
- React 18
- TypeScript
- Tailwind CSS
