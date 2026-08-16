import { fetchGitlabContributions, GitStatsError } from "../index";

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body,
  } as unknown as Response;
}

describe("fetchGitlabContributions", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("converts the calendar map to days", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockResponse({ "2025-01-01": 3, "2025-01-03": 2 }));

    const days = await fetchGitlabContributions("octocat");
    expect(days).toEqual([
      { date: "2025-01-01", count: 3 },
      { date: "2025-01-02", count: 0 },
      { date: "2025-01-03", count: 2 },
    ]);
  });

  it("filters zero and non-numeric counts", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockResponse({ "2025-01-01": 0, "2025-01-02": 4, "2025-01-03": null })
      );

    const days = await fetchGitlabContributions("octocat");
    expect(days).toEqual([{ date: "2025-01-02", count: 4 }]);
  });

  it("returns empty array for empty calendar", async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({}));

    const days = await fetchGitlabContributions("nobody");
    expect(days).toEqual([]);
  });

  it("throws GitStatsError with status 404 for missing users", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockResponse({ error: "not found" }, 404));

    await expect(fetchGitlabContributions("ghost")).rejects.toThrow(
      'GitLab user "ghost" not found'
    );
    await expect(fetchGitlabContributions("ghost")).rejects.toThrow(
      GitStatsError
    );
  });

  it("throws GitStatsError on rate limit", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockResponse({ error: "rate limited" }, 429));

    await expect(fetchGitlabContributions("octocat")).rejects.toThrow(
      "GitLab rate limit exceeded"
    );
  });

  it("throws GitStatsError on 403 block", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockResponse({ error: "blocked" }, 403));

    await expect(fetchGitlabContributions("private-user")).rejects.toThrow(
      "GitLab blocked this request"
    );
  });

  it("throws GitStatsError on unexpected status", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockResponse({ error: "boom" }, 500));

    await expect(fetchGitlabContributions("octocat")).rejects.toThrow(
      "unexpected error"
    );
  });
});
