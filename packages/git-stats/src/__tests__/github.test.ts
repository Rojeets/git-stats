import {
  fetchGithubContributions,
  GitStatsError,
} from "../github";

describe("fetchGithubContributions", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("parses contribution cells from the HTML fragment", async () => {
    const html = `
      <table>
        <td data-date="2025-01-01" data-level="2"><tool-tip>5 contributions</tool-tip></td>
        <td data-date="2025-01-02" data-level="0"><tool-tip>No contributions.</tool-tip></td>
        <td data-date="2025-01-03" data-level="1"><tool-tip>1 contribution</tool-tip></td>
      </table>
    `;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => html,
    } as Response);

    const days = await fetchGithubContributions("octocat");
    expect(days).toEqual([
      { date: "2025-01-01", count: 5 },
      { date: "2025-01-02", count: 0 },
      { date: "2025-01-03", count: 1 },
    ]);
  });

  it("returns empty array when no contribution cells found", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => "<html>nothing here</html>",
    } as Response);

    const days = await fetchGithubContributions("nobody");
    expect(days).toEqual([]);
  });

  it("throws GitStatsError with status 404 for missing users", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
    } as Response);

    await expect(fetchGithubContributions("ghost")).rejects.toThrow(
      GitStatsError
    );
    await expect(fetchGithubContributions("ghost")).rejects.toThrow(
      'GitHub user "ghost" not found'
    );
  });

  it("throws GitStatsError with status 429 on rate limit", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers(),
    } as Response);

    await expect(fetchGithubContributions("octocat")).rejects.toThrow(
      "GitHub rate limit exceeded"
    );
  });

  it("encodes the username in the URL", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => "",
    } as Response);
    global.fetch = fetchMock;

    await fetchGithubContributions("a b/c");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://github.com/users/a%20b%2Fc/contributions",
      expect.any(Object)
    );
  });
});
