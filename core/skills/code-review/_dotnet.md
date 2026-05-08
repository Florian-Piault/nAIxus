# C#/.NET Review Guidelines

Use these checks in addition to the common review workflow.

## Correctness and API contracts

- Check nullability annotations and nullable reference type assumptions.
- Verify async methods are awaited, cancellation tokens are propagated where part of the existing pattern, and sync-over-async is not introduced.
- Look for changed public contracts: DTOs, serialization names, route shapes, status codes, validation rules, and exception behavior.
- Confirm LINQ queries preserve intended filtering, ordering, grouping, and deferred execution semantics.

## Data and persistence

- For Entity Framework changes, check tracking vs no-tracking behavior, eager/lazy loading assumptions, transaction boundaries, migrations, and N+1 query risks.
- For database writes, review idempotency, uniqueness, concurrency tokens, and partial-failure behavior.
- Treat data loss, incorrect authorization filters, and broken migrations as `🔴 BLOCKER` candidates.

## Security

- Check authentication and authorization are enforced at the right layer.
- Watch for over-posting/mass-assignment, unsafe deserialization, path traversal, injection, and leaking secrets or PII in logs/errors.
- Verify tenant/user scoping is preserved in queries and commands.

## Maintainability

- Prefer consistency with existing project patterns over new abstractions.
- Flag broad service/repository changes only when they obscure behavior, weaken invariants, or make testing materially harder.
