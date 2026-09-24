# Architect 2.0 — code audit and public-demo hardening

24 September 2026. Review scope: the application source, API/authentication boundary, database schema and queries, shared validation, state persistence, all feature-flow modules, build configuration, package lock, tests, and repository publication hygiene. Vendored UI/build support files were inventoried and scanned; this is not an independent certification of every third-party dependency.

## Engineering verdict

The updated repository has stronger, demonstrable engineering controls: strict types, full-source zero-warning lint, validated server boundaries, atomic optimistic concurrency, explicit failure recovery, security regression tests, pinned CI actions, and a patched dependency tree. These are useful evidence of competence. A claim that its developer is in the “top 1%” cannot be measured or certified from this review.

This remains a public product-experience prototype, not a production coding-agent service. Opening access does not make the simulated generation, integrations, team permissions, billing, or app deployments real. The previous owner audit's private-pilot recommendation is historical; this release follows the owner's explicit request for a public demo.

## Findings and fixes

| Priority | Finding                                                                                                                                       | Resolution and evidence                                                                                                                                                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| High     | Installed dependencies had 19 audit findings: 9 high, 9 moderate, 1 low. React Server Components included a known denial-of-service advisory. | Updated compatible React/RSC, Vinext, Vite, Cloudflare tooling and transitive packages; scoped the legacy Drizzle loader's esbuild override. Final dependency audit: zero known findings. This is a point-in-time package check, not proof of no vulnerabilities.                    |
| High     | A failed initial load could be switched into a save attempt using seed data; users could interact before saved state arrived.                 | Separate load retry from save retry; gate editing until a validated response arrives; cancel abandoned loads. Browser regression verifies failed loads issue no writes. Existing optimistic concurrency already reduced overwrite risk; this was not confirmed cross-user data loss. |
| High     | An earlier save response could display “All changes saved” while a later edit remained pending.                                               | Serialized save queue with latest-snapshot comparison, validated acknowledgement, skipped superseded queued snapshots, unsaved-exit warning and explicit retry. Delayed-response browser test verifies the newest edit wins.                                                         |
| Medium   | Conflict recovery inside a project exported only that project, omitting unsaved workspace settings or other projects.                         | Conflict action now exports the entire workspace; reload preserves the other tab's accepted revision. Browser test checks exported settings and project list.                                                                                                                        |
| Medium   | Request size was checked as character count after reading the entire body.                                                                    | Enforce 600,000 bytes while streaming, including missing or misleading Content-Length and multibyte text; reject invalid JSON and non-JSON media types before storage.                                                                                                               |
| Medium   | Error responses lacked explicit private cache controls; schema accepted duplicate project/agent IDs and unsafe integer revisions.             | Uniform private/no-store and nosniff JSON responses; unique project/agent IDs, route-safe IDs, safe revision limits, and stored-state validation. Parameterized SQL retained.                                                                                                        |
| Medium   | Sidebar fixed header and promotional footer left almost no usable navigation at short heights.                                                | Compact usage row; smaller responsive header/footer; flexible scrollable navigation; thin scrollbar; explicit navigation landmark; mobile drawer closes after navigation. Verify at 600/768/900 heights and on mobile.                                                               |
| Medium   | A delayed deployment simulation could finish after its modal was dismissed; overlapping file reads could validate an older selected file.     | Cancel deployment timer on unmount; invalidate superseded file reads; align import size checks with UTF-8 byte limits.                                                                                                                                                               |
| Medium   | Public users had no explicit sign-out action and the sidebar showed a generic identity.                                                       | Account → Sign out uses the platform-owned top-level route; sidebar displays current identity. Sign-out API rejection is exercised locally.                                                                                                                                          |
| Low      | Success-toast text failed automated AA contrast at its default small size.                                                                    | Corrected the light-theme success text token; retested with the toast present and mobile drawer open.                                                                                                                                                                                |
| Low      | Persistence logic was mixed into a large shell; only targeted lint and selected failure paths had evidence.                                   | Extracted `use-workspace.ts`, `db/http.ts`, and `db/workspace-repository.ts`; full-source lint; security/SQLite and browser resilience suites; read-only CI with pinned action commits.                                                                                              |

React advisory source: [React server function denial of service and patched versions](https://github.com/advisories/GHSA-wx67-qw84-cm4g). Exact before/after package audit records are retained in the repository evidence directory. A scoped override was used instead of the audit tool's suggested breaking Drizzle downgrade; migration generation and the production build are checked separately.

## Review by engineering dimension

- **Authentication and isolation:** every API request checks server identity; user-provided fields never choose the database owner. Two-user SQLite tests exercise the actual bound SQL. Production identity relies on Sites dispatch stripping/setting its authentication headers. The local mock does not ship as a sign-in handler in the Worker. Demo membership records grant no access.
- **Input and injection safety:** imported data is validated through Zod; ordinary strings render through React escaping. The app does not run imported code, fetch repository URLs, interpolate user input into SQL, or store entered secret values. The unused vendored chart CSS helper must not be fed untrusted chart configuration in future work.
- **Data integrity and recovery:** atomic compare-and-update; first-save collisions cannot replace an existing row; load/save failures remain explicit; user edits can be exported after conflict. Recovery tests use a real local API plus controlled transport failures. The whole-workspace document remains a deliberate prototype limitation.
- **Concurrency and asynchronous UX:** serialized writes, stale-response status protection, cancellation of unmounted deployment timers, stale file-read rejection, and post-load editing gate. No real collaborative editing is claimed.
- **Maintainability:** small independently testable persistence boundaries, shared schemas, strict TypeScript, committed lockfile, repeatable commands and CI. Large feature-view/modal files remain candidates for incremental extraction as real adapters arrive; cosmetic mass rewrites were avoided.
- **Accessibility and responsive UX:** semantic controls, keyboard command navigation, dialog primitives, explicit labels, reduced-motion support, constrained-height navigation, contrast and overflow checks. Automated scans cannot replace assistive-technology research.
- **Performance:** debounced serialized persistence and superseded-write skipping; bounded payload and list sizes. No load test, production latency SLO, bundle-size budget, or large-account performance certification is claimed.
- **Observability and privacy:** generic structured error event names without request bodies, redacted client errors, per-user rows and no-store responses. No third-party tracking was added. Real operational alerting and backup drills remain future work.
- **Supply chain and repository:** dependency advisories patched, history scanned for high-confidence credential patterns, environment/runtime directories ignored, CI actions pinned by verified commit SHA, checkout credentials not persisted, repository token permissions read-only.
- **Testing quality:** security cases test multibyte/streaming bounds and real SQLite isolation/concurrency, not just implementation mirrors. Browser cases include delayed responses, initial-load failure, recoverable save failure, conflicts, whole-workspace export and sign-out. Existing feature journeys remain regression-tested.

## Public access model

The source repository is made public at the owner's request. The Site audience is changed to public after publishing the hardened version. Anonymous visitors reach the sign-in page; a ChatGPT account is required to enter a saved workspace. “Public” does not make every user's projects visible to other users. Google, GitHub and enterprise SSO remain prototype setup journeys, not connected identity providers.

Repository credential scanning includes all reachable historical blobs, not just the current checkout. Only finding counts and object/path identifiers are recorded; secrets are not printed. Pattern-based scanning cannot guarantee the absence of every possible secret. Local test data and generated build artifacts remain ignored.

## Remaining limits and follow-up priorities

1. Production-grade abuse throttling, capacity limits, monitoring, retention/deletion policy and recovery drills are still needed before treating this as a commercial service.
2. Real multi-account hosted sign-in should be exercised by independent users. SQLite isolation and local dispatcher tests are evidence for the implementation, not an external identity-provider penetration test.
3. Feature parity with the original Architect remains unverified; source/runtime integrations are intentionally simulated.
4. A beta server framework and scoped transitive override require continued dependency maintenance. CI should catch regressions; it does not replace review of framework changes.
5. Browser evidence is Chrome-based. A full Safari/Firefox/device matrix and screen-reader usability study remain outside this audit.
6. The 600 KB per-user document and optimistic revision conflict model are appropriate for a bounded demo. Normalize storage and permissions before multi-user collaboration or large projects.

The honest confidence statement is: **audited and hardened public prototype with reproducible checks and explicit limits**, not an unqualified top-percentile or production-security certification.

## Final verification record

- **111 passing checks:** 39 existing browser/API regressions; 24 onboarding/portability/evidence checks; 29 new recovery, identity and sidebar checks; 19 security and real-SQLite tests.
- **Zero automated accessibility violations** across 19 main screens and the open mobile sidebar, including a visible success toast.
- Responsive coverage includes the original 19 mobile-width screens, all key sidebar destinations at 600/768/900-pixel heights, and mobile drawer dismissal.
- Full-source ESLint with zero warnings and strict TypeScript checks passed.
- Dependency audit changed from 19 findings to **zero**; no forced major-version downgrade was used.
- The patched Drizzle migration generator ran successfully and found no schema changes.
- History scan examined 138 reachable blobs before this release, with zero high-confidence credential matches and zero forbidden tracked environment/runtime files. A final history scan is performed again before changing repository visibility.
- Browser tests reported no page runtime exceptions. Tests intentionally use disposable local data; no customer workspace was reset.

Evidence files are in `docs/code-audit-evidence/`. Accessibility and responsive checks are partly included in the 111-check total, not additional independent functional tests. SQL tests execute actual SQLite statements through a D1-shaped adapter; they are not a hosted multi-account or distributed-load test. CI execution status and successful hosting publication are reported separately at delivery.

Production build passed with three intended routes (home, authentication, workspace API). No development mock identity markers were found in the Worker output. Vite emitted advisory future-config and plugin-timing warnings; no build errors occurred.

