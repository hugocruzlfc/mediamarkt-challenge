---
name: cqrs-module
description: Use this skill whenever adding a new command, query, or domain module to the Store Apps Platform. Covers the CQRS-lite layering (domain/application/infrastructure), exactly where new files go, how to wire a new handler into the InversifyJS container, and how to map domain errors to GraphQL errors.
---

# CQRS-lite module pattern — Store Apps Platform

This repo separates **commands** (state-changing operations) from **queries** (read operations)
as distinct, single-purpose classes. There is **no command bus or mediator** — handlers are
injected directly wherever they're needed via InversifyJS. Keep it that way unless there's a
concrete, stated reason to add indirection (there almost never is at this project's scale).

## Folder shape for every domain module

```
src/modules/<domain>/
  domain/
    <entity>.entity.ts      # entity + invariants, pure TS, no framework imports
    errors.ts                # domain-specific error classes (e.g. InvalidTransitionError)
    types.ts                 # value objects (e.g. Customer, LineItem)
  application/
    commands/
      <verb-noun>.command.ts  # plain data object: the input shape
      <verb-noun>.handler.ts  # @injectable(), one `execute()` method
    queries/
      <verb-noun>.query.ts
      <verb-noun>.handler.ts
  infrastructure/
    persistence/
      <entity>.schema.ts       # Mongoose schema — persistence shape only
      <entity>.repository.ts   # implements a domain-level repository interface
      <entity>-repository.interface.ts  # port defining the repository contract
    graphql/
      <domain>.typedefs.ts
      <domain>.resolvers.ts
```

## Steps to add a new command (e.g. `TransitionOrder`, `CancelOrder`)

1. **Domain first.** Add or extend the invariant inside `domain/<entity>.entity.ts` — e.g. a
   method like `order.transitionTo(newState, employeeId?)` that throws a domain error (from
   `domain/errors.ts`) when the transition or missing invariant is invalid. Write the unit test
   for this method *before* the handler.
2. **Command + handler.** Create `<verb-noun>.command.ts` (just the input shape, e.g.
   `{ orderId: string; employeeId?: string }`) and `<verb-noun>.handler.ts`. The handler:
   - is `@injectable()`
   - receives its repository via constructor injection (`@inject(TYPES.OrderRepository)`)
   - loads the entity, calls the domain method, persists, returns the updated entity
   - does **not** contain the invariant logic itself — that lives only in the entity
3. **Bind it.** Register the handler in `src/container/inversify.config.ts` under its own `Symbol`
   declared in `src/container/types.ts`.
4. **Expose via GraphQL.** Add the mutation to `<domain>.typedefs.ts`. In
   `<domain>.resolvers.ts`, pull the handler out of the container and call `.execute(command)`.
   Map thrown domain errors to a `GraphQLError` with a stable `extensions.code` (e.g.
   `INVALID_TRANSITION`, `EMPLOYEE_REQUIRED`) — never let a raw error reach the client.
5. **Test.** Unit-test the handler against a fake/in-memory repository. Optionally
   integration-test the resolver end-to-end against a test Mongo instance.

## Steps to add a new query (e.g. `ListOrders`, `GetOrder`)

Same shape, minus the domain-invariant step — queries don't mutate, so they're mostly
repository calls plus light filtering/shaping. Keep filtering and pagination logic inside the
handler, not the resolver.

## Anti-patterns to avoid

- Injecting the whole IoC container into a resolver ("service locator") instead of injecting
  the specific handler it needs.
- Any `if (order.state === ...)` branching living in a resolver, a handler, or a Mongo
  schema/middleware. It belongs only in the entity.
- Adding a generic `CommandBus` / `QueryBus` abstraction "to look more CQRS." With a handful of
  commands and queries, direct injection is simpler and equally testable — don't add a layer of
  indirection nobody asked for.
- Reusing one Mongoose schema file as if it were the domain entity. The schema is a persistence
  detail; the entity is where the rules live.
