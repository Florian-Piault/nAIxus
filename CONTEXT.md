# nAIxus Context

nAIxus manages shared agent setup resources across multiple AI coding harnesses.

## Language

**Harness**:
An AI coding tool environment that has native folders for agent setup resources.
_Avoid_: target tool, platform

**Target**:
A supported harness selected for an install, sync, doctor, or path operation.
_Avoid_: platform, provider

**Resource**:
A file or directory from `core/` or `harness/` that nAIxus installs into a target's native folders.
_Avoid_: asset, artifact

**Installation Plan**:
The ordered set of source-to-destination resource operations for a target.
_Avoid_: mapping, manifest

## Relationships

- A **Target** identifies exactly one **Harness**.
- An **Installation Plan** contains zero or more **Resources**.
- A **Resource** has one repository source and one native destination for a given **Target**.

## Example dialogue

> **Dev:** "When we add a new **Resource**, should `doctor` know about it?"
> **Domain expert:** "Yes — both install and doctor should derive from the same **Installation Plan** for the selected **Target**."

## Flagged ambiguities

- "target" is used in the CLI; resolved: **Target** means the selected supported harness, while **Harness** means the tool environment itself.
