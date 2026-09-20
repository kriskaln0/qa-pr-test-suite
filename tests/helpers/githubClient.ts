import {
  describeErrors,
  GithubPullRequest,
  validateGithubPullRequests,
} from "./schemas";

const BASE_URL = "https://api.github.com";
const MAX_PAGES = 50; //limit

export const PER_PAGE = 100;

export interface FetchOptions {
  owner: string;
  repo: string;
  token?: string;
  sendRequest?: typeof fetch;
}

export async function fetchOpenPullRequests({
  owner,
  repo,
  token,
  sendRequest = fetch,
}: FetchOptions): Promise<GithubPullRequest[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const pullRequests: GithubPullRequest[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `${BASE_URL}/repos/${owner}/${repo}/pulls` +
      `?state=open&per_page=${PER_PAGE}&page=${page}&sort=created&direction=asc`;

    const response = await sendRequest(url, { headers });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Github request failed: ${response.status}, ${response.statusText} on page ${page}: ${body}`);
    }

    const pageOfPullRequests = await response.json();
    if (!validateGithubPullRequests(pageOfPullRequests)) {
      throw new Error(
        `Schema validation failed for page ${page}:\n  ${describeErrors(validateGithubPullRequests)}`
      );
    }

    pullRequests.push(...pageOfPullRequests);

    //page is not full = stop
    if (pageOfPullRequests.length < PER_PAGE) {
      break;
    }
  }

  return pullRequests;
}
