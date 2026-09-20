import { AggregatePayload, GithubPullRequest } from "./schemas";

const HIGH_PRIORITY_LABEL = "high-priority";

//part1: filter open and non draft pull requests
export function openNonDraftPullRequests(pullRequests: GithubPullRequest[]): GithubPullRequest[] {
  return pullRequests.filter((pr) => pr.state === "open" && !pr.draft);
}

//part2: business rules validation
export interface ValidationIssue {
  rule:
    | "INTEGRITY_COUNT_MISMATCH"
    | "HIGH_PRIORITY_DRAFT_CONFLICT";
  message: string;
  prId?: number;
}

export function validateBusinessRules(payload: AggregatePayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const actualCount = payload.pull_requests.length;


  //rule1: INTEGRITY_COUNT_MISMATCH
  if (actualCount !== payload.total_open_prs) {
    issues.push({
      rule: "INTEGRITY_COUNT_MISMATCH",
      message: `Payload has ${payload.total_open_prs} open PRs, but the list has ${actualCount}.`,
    });
  }

  //rule2: cant be draft if labeled as high priority
  for (const pr of payload.pull_requests) {
    if (pr.labels.includes(HIGH_PRIORITY_LABEL) && pr.meta.is_draft) {
      issues.push({
        rule: "HIGH_PRIORITY_DRAFT_CONFLICT",
        prId: pr.id,
        message:
          `PR #${pr.id} ("${pr.title}") is labeled "${HIGH_PRIORITY_LABEL}" but is ` +
          `marked as draft (High-priority PRs must not be drafts)`,
      });
    }
  }

  return issues;
}

//each object in the issues array will be formatted into a string
export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((issue) => `  [${issue.rule}] ${issue.message}`).join("\n");
}
