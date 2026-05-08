---
name: code-review
description: Performs read-only code reviews of current diffs with labelled, actionable findings. Use when the user asks for a code review, PR review, review of changes, or feedback on a git diff.
---

# Code Review

## Non-negotiable tool policy

This is a read-only skill.

Allowed:

- Read files with `read`.
- Inspect paths with read-only shell commands: `ls`, `find`, `rg`.
- Inspect git state with read-only git commands: `git status`, `git diff`, `git log`, `git show`.

Forbidden unless the user explicitly leaves review mode:

- `write`, `edit`, formatters, codemods, fix commands, test snapshot updates, package installs, migrations.
- Commands that may write caches, reports, generated files, lockfiles, or snapshots.

If a useful check would require writing or running tools outside the allowlist, mention it as an optional follow-up instead of running it.

## Default workflow

1. Determine review target:
   - Default: current diff (`git status`, then `git diff`).
   - If staged changes matter, inspect `git diff --staged` too.
   - If the user names files, paths, or a base branch, review that explicit scope.
2. Read enough surrounding code to understand behavior, not just changed lines.
3. Load language-specific guidance when relevant:
   - .NET: see [DOTNET.md](_dotnet.md)
   - Angular: see [ANGULAR.md](_angular.md)
4. Review for correctness first, then security, data integrity, concurrency, API contracts, maintainability, and user impact.
5. Report only actionable findings. Do not pad with generic advice.

## Feedback labels

Every finding must use exactly one label:

- `🔴 BLOCKER` — likely production breakage, security issue, data loss/corruption, failed build, or wrong core behavior. Should block merge.
- `🟠 MAJOR` — significant bug, missing important test, risky edge case, performance issue, or maintainability problem that should be fixed before merge if practical.
- `🟡 MINOR` — small bug, localized maintainability issue, confusing code, or non-blocking test gap.
- `🟢 NICE TO HAVE` — optional improvement, readability suggestion, or future cleanup. Never present as required.

Prefer the lowest label that accurately reflects user impact. If uncertain, state the assumption.

## Output format

Start with findings, ordered by severity and then by code location.

```md
## Findings

- LABEL — `path/to/file.ext:line`
  - Issue: What is wrong.
  - Impact: Why it matters.
  - Suggestion: Concrete fix direction, without editing files.

## Summary

[Brief overall assessment. Mention if no blocking findings were found.]

## Not run

[List checks not run because this skill is read-only, if relevant.]
```

If there are no findings, say so plainly and include a short summary of what was reviewed.

## Review standards

- Do not flag unchanged pre-existing issues unless the diff makes them worse or depends on them.
- Avoid style-only comments unless style creates confusion or violates an evident local convention.
- Include file and line references whenever possible.
- Prefer concrete examples over vague advice.
- Distinguish confirmed issues from risks: use phrases like “This appears to…” or “If X can happen…” when evidence is incomplete.
- Do not propose large rewrites when a small targeted fix solves the issue.
