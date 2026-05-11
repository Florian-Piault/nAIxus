---
name: commit
description: Commit (and push) your code to the repository
---

# Commit

- if asked by user, use `code-review` first
- else proceed with `commit`

## What to commit

- if no instruction given, take current work in this session
- else commit according to instruction

## Syntax

- use conventionnal commit message : `[type]: [Explication en francais]`
- [type] can be one of the following :
  - `feat` : new feature
  - `fix` : bug fix
  - `docs` : documentation only changes
  - `style` : formatting, missing semi colons, etc; no code change
  - `refactor` : refactoring production code
  - `test` : adding missing tests, refactoring tests; no production code change
  - `chore` : updating grunt tasks etc; no production code change
- Add a description of the change in the body if needed

## Commit example

```
[type]: [description]

## *Changement 1*

[description]

## *Changement 2*

[description]

```

Finish by pushing the commit to the repository if asked
