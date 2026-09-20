# QA Engineer Backend Technical Challenge Test Suite

Part 1: The API Integration (Live Data)

Part 2: Business Rule Validation (Mocked Scenario)


TypeScript, Vitest, JSON Schema (ajv validator).

### How to run it

```bash
npm install
npm test            # all tests
npm run test:live   # Part 1 only, hits Github
npm run test:mock   # Part 2 only, no network
npm run report      
```

`GITHUB_TOKEN` is optional, 60 requests per hour.


### Layout

```
tests/helpers/githubClient.ts   calls Github, walks the pages
tests/helpers/schemas.ts        JSON Schema definitions and their types
tests/helpers/rules.ts          the business rules
tests/part1-github-api.test.ts  the live test
tests/part2-mock-validation.test.ts  the mocked data test
```

### Architectural decisions

* One file per job: the client talks to Github, the rules are plain
  functions, the tests assert. Change the repo and the result should be the same
* JSON Schema and ajv validator - the schema is plain data, so it can be reused outside this suite
* Walk pages by number and stop on the first page that isnt full (part 1)
* Rules return a list of problems instead of throwing, so you can see all the issues in the report (part 2)
* Vitest instead of Jest or Playwright - modern and lighter framewrok for backend tests


### Pagination

Github sends at most 100 PRs per request and appwrite has 549, so one
request will give the worng number. 
The client api asks for page 1, page 2, and so on,
 and stops when a page comes back with fewer than 100 items.

Pages are sorted oldest first. The test checks no id appears twice.


### Assertions

Tests assert the Json structure first, then rules, so a broken response and a broken rule dont
look the same

**Part 1** - The schema checks six fields (id,  number, title, state,
draft, html_url) and ignores the ~35 others Github sends.
Available fields - `curl -s "https://api.github.com/repos/appwrite/appwrite/pulls?per_page=1"`
Documentation: `https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10#list-pull-requests`

**Part 2** - structure first, then two business rules:

- `total_open_prs` must match the number of items in the list
- a PR labelled `high-priority` must not be a draft

They return a list of everything wrong rather than throwing on the first
problem. The last test breaks both rules on purpose, so we know the error
messages really appear

### Assumptions?

* "Open" means open and not draft. Github reports drafts as: state: open
  with a separate flag, so that filter lives in our code.
* The live test checks properties, not an exact number - the repo changes by
  the hour. It prints the count instead:
  `Open PRs: 549 | Drafts: 47 | Counted: 502`
* Part 2 checks only the two rules the lists
`high-priority` is matched exactly, case sensitive