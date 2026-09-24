# Security and deployment boundaries

Architect 2.0 is a public UX prototype with a private workspace per signed-in ChatGPT user. App generation, external services, agent execution and application releases are demonstrations. Do not enter credentials or sensitive production data.

## Identity trust

Deploy this Worker behind the Sites dispatcher, which owns sign-in/out and supplies authenticated identity headers. Never expose its origin with client-controlled identity headers. Local sign-in is development-only middleware, strips spoofed identity headers, and uses a fixed disposable test user. It is not production authentication.

The API keys rows only by the server's authenticated user ID. Demo members and role labels do not grant anyone access. Every workspace response, including errors, is marked private/no-store. Writes require JSON, enforce origin/fetch metadata, stream a 600,000-byte maximum, validate the shared schema and use atomic revision checks. No user-provided code, imported URL or project instruction is executed.

## Reporting

Use the repository's private vulnerability reporting feature if enabled. Do not include secrets, personal data, or exploit details in a public issue. Otherwise contact the repository owner through an existing private channel.

## Reproducible checks

Run `npm run lint`, `npm run typecheck`, `npm run test:security`, `npm audit`, and the browser suites documented in README.md. Dependencies are locked; CI uses pinned action commits and read-only repository permissions. The esbuild override is scoped to the legacy Drizzle loader to remove its vulnerable development server dependency; verify migration generation after dependency updates.

## Limits

No independent penetration test, availability/load certification, account-abuse rate-limit validation, backup restore drill, or enterprise role enforcement is claimed. SQLite integration tests cover user isolation and optimistic concurrency; live multi-account sign-in still depends on the hosting provider. No HTTP transport or credential bypass is provided for other hosting environments.
