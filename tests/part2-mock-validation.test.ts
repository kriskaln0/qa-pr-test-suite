import { describe, expect, it } from "vitest";
import validPayload from "./fixtures/mockPayload.json";
import { describeErrors, validateAggregatePayload } from "./helpers/schemas";
import { formatIssues, validateBusinessRules } from "./helpers/rules";

describe("Part 2 - aggregated payload", () => {
  //is the data in the mocked payload valid according to the JSON schema?
  it("matches the expected structure", () => {
    const valid = validateAggregatePayload(validPayload);

    if (!valid) {
      console.error(describeErrors(validateAggregatePayload));
    }

    expect(valid).toBe(true);
  });

  //check the business rules against the payload ("total_open_prs": 5, with 1 item in the list)
  it("check every business rule", () => {
    if (!validateAggregatePayload(validPayload)) {
      throw new Error(describeErrors(validateAggregatePayload));
    }

    const issues = validateBusinessRules(validPayload);

    expect(issues).toEqual([]);
  });

  //simulate a broken payload to ensure all violations are reported
  it("reports every violation, with a clear message, when the payload is broken", () => {
    const [template] = validPayload.pull_requests;
    const broken = {
      ...validPayload,
      total_open_prs: 5,
      pull_requests: [
        //high-priority, but draft
        { ...template, meta: { ...template.meta, is_draft: true } },
        { ...template, id: 2048, title: "chore: bump dependencies" },
      ],
    };

    if (!validateAggregatePayload(broken)) {
      throw new Error(describeErrors(validateAggregatePayload));
    }

    const issues = validateBusinessRules(broken);

    console.error("Expected violations:\n" + formatIssues(issues));
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "INTEGRITY_COUNT_MISMATCH" }),
        expect.objectContaining({ rule: "HIGH_PRIORITY_DRAFT_CONFLICT", prId: 1024 }),
      ])
    );
  });
});
