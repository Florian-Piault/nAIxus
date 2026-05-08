# TypeScript/Angular Review Guidelines

Use these checks in addition to the common review workflow.

## TypeScript correctness

- Check that types express real runtime possibilities; flag unsafe casts, `any`, non-null assertions, and widened types when they hide likely bugs.
- Verify optional/undefined/null handling, especially around API responses, form values, and route params.
- Check changed async flows for missed awaits, swallowed errors, duplicate subscriptions, and race conditions.

## Angular components and templates

- Verify inputs, outputs, signals, observables, and lifecycle hooks stay consistent with existing Angular version and project patterns.
- Check template bindings for null-safety, expensive repeated calls, incorrect `trackBy`/`track`, and broken accessibility attributes.
- Watch for state duplicated between component fields, forms, signals, and services.

## RxJS and subscriptions

- Check subscription lifetime management: async pipe, `takeUntilDestroyed`/`takeUntil`, or existing teardown pattern.
- Review operator choice for cancellation and ordering (`switchMap`, `mergeMap`, `concatMap`, `exhaustMap`).
- Flag nested subscriptions when they introduce leaks, races, or unclear error handling.

## Forms, routing, and HTTP

- For forms, verify validators, disabled controls, reset behavior, typed forms, and submit-state handling.
- For routing, check guards/resolvers, param changes without component recreation, and navigation side effects.
- For HTTP, check error states, loading states, retry behavior, DTO mapping, and backend contract assumptions.

## Security and UX

- Treat unsafe HTML binding, bypassed sanitization, token leakage, and authorization/client trust mistakes as `🔴 BLOCKER` candidates.
- Check user-visible changes for accessibility, focus management, translations, and clear error messages when relevant.

## Tests

- Expect tests for changed business logic, guards, services, critical component interactions, and regressions around forms or async behavior.
- Missing tests for important changed behavior are usually `🟠 MAJOR`; missing tests for simple display-only changes may be `🟡 MINOR` or omitted.
