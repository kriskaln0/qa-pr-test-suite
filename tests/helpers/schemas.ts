import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); 

//part 1
export interface GithubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  html_url: string;
}

const githubPullRequestSchema: JSONSchemaType<GithubPullRequest> = {
  type: "object",
  properties: {
    id: { type: "number" },
    number: { type: "number" },
    title: { type: "string" },
    state: { type: "string", enum: ["open", "closed"] },
    draft: { type: "boolean" },
    html_url: { type: "string", format: "uri" },
  },
  required: ["id", "number", "title", "state", "draft", "html_url"],
  additionalProperties: true,
};

export const validateGithubPullRequests: ValidateFunction<GithubPullRequest[]> =
  ajv.compile({
    type: "array",
    items: githubPullRequestSchema,
  });

//part 2
export interface AggregatePullRequest {
  id: number;
  title: string;
  author: { username: string; role: string };
  status: "OPEN" | "CLOSED" | "MERGED";
  labels: string[];
  meta: { is_draft: boolean; review_comments: number };
}

export interface AggregatePayload {
  product_id: string;
  total_open_prs: number;
  last_updated: string;
  pull_requests: AggregatePullRequest[];
}

const aggregatePullRequestSchema: JSONSchemaType<AggregatePullRequest> = {
  type: "object",
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    author: {
      type: "object",
      properties: {
        username: { type: "string" },
        role: { type: "string" },
      },
      required: ["username", "role"],
    },
    status: { type: "string", enum: ["OPEN", "CLOSED", "MERGED"] },
    labels: { type: "array", items: { type: "string" } },
    meta: {
      type: "object",
      properties: {
        is_draft: { type: "boolean" },
        review_comments: { type: "integer", minimum: 0 },
      },
      required: ["is_draft", "review_comments"],
    },
  },
  required: ["id", "title", "author", "status", "labels", "meta"],
  additionalProperties: false,
};

export const validateAggregatePayload: ValidateFunction<AggregatePayload> =
  ajv.compile({
    type: "object",
    properties: {
      product_id: { type: "string" },
      total_open_prs: { type: "integer", minimum: 0 },
      last_updated: { type: "string", format: "date-time" },
      pull_requests: { type: "array", items: aggregatePullRequestSchema },
    },
    required: ["product_id", "total_open_prs", "last_updated", "pull_requests"],
    additionalProperties: false,
  });
export function describeErrors(validate: ValidateFunction): string {
  return ajv.errorsText(validate.errors, { separator: "\n  " });
}
