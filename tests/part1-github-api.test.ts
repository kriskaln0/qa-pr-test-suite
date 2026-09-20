import { describe, expect, it } from "vitest";
import { fetchOpenPullRequests } from "./helpers/githubClient";
import { openNonDraftPullRequests } from "./helpers/rules";

describe("Part 1: Github open pull requests", () => {
  it("counts every open, non-draft PRs", async () => {
    const pullRequests = await fetchOpenPullRequests({
      owner: "appwrite",
      repo: "appwrite",
      token: process.env.GITHUB_TOKEN,
    });

    const counted = openNonDraftPullRequests(pullRequests);

    const drafts = pullRequests.length - counted.length;
    console.log(`Open PRs: ${pullRequests.length} | Drafts: ${drafts} | Counted: ${counted.length}`);

    expect(pullRequests.length).toBeGreaterThan(0);

    const ids = pullRequests.map((pr) => pr.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const pr of counted) {
      expect(pr.state).toBe("open");
      expect(pr.draft).toBe(false);
    }
  });
});
