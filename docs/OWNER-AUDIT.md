# Architect 2.0 — owner, user, and competitive audit

**24 September 2026 · Evidence-led product review · Updated prototype**

## Owner decision

Continue with a **private design-partner release**, not a broad production-platform launch. Architect 2.0 has a clearer concept for business–engineering collaboration and a demonstrable multi-stage workflow. It does not yet provide the execution, repository integration, or operational evidence needed to displace mature coding platforms.

The strongest positioning is: **turn a business outcome into an agent application that a developer can inspect, validate, and operate—without losing the original intent.** Start with support and internal-operations workflows requiring human approval. Do not compete primarily on “all features from every builder” or “any framework.”

Three changes were implemented from this audit: guided starting paths and a prompt library; genuine configuration export/import with an engineering handoff; and an evidence ledger that distinguishes configured settings from verified runtime behavior. They improve the prototype's honesty and usefulness. They do not close the production-runtime gap.

The prior 9/10 was a self-assessment against a permissive UX-prototype brief. It was **not a comparative market score, independent usability result, or production-readiness certification**. This audit supersedes that broader interpretation.

## 1. What was actually verified

Evidence classes used throughout:

- **Observed:** your supplied screenshot, the implementation, real local UI/API behavior, and the hosted publication status.
- **Documented:** current first-party product documentation; a vendor claim, not an independently tested capability.
- **Inferred:** product judgment or a hypothesis about user motivation.
- **Unverified:** requires authenticated baseline testing, customer research, or a real runtime integration.

Your reference image shows a **signed-in Architect home/workspace**, with an organization selector, account balance, project navigation, Agent Studio, prompt library, marketplace, usage, help, integrations, a prompt field, attachment control, and microphone icon. It is not evidence of the original authentication journey. A visible control establishes discoverability, not whether its downstream feature works.

The original website's public page did not expose sufficient application content for a full authenticated flow audit. No existing customer projects were opened or modified. Therefore, this report does **not** claim an exhaustive feature inventory, parity certification, or a measured superiority result against the original application.

The updated product is the separate Architect 2.0 prototype at [architect-studio-two.aihardikbhatt.chatgpt.site](https://architect-studio-two.aihardikbhatt.chatgpt.site), not a modification of the production architect.new service.

First-party documentation was cross-checked for all nine named platforms. No interviews, conversion experiments, retention analyses, or competitor performance benchmarks were conducted. Psychology and switching predictions below are hypotheses to test, not findings from actual users.

## 2. Base version versus 2.0: improvements and regressions

| Area                | Base evidence                                                     | 2.0 before this audit                                                          | Audit improvement / remaining gap                                                                                              |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Positioning         | Explicitly addresses executives and consultants in the screenshot | Broader apps-and-agents message; target user less explicit                     | Business and Technical builder starting paths now explain what each can do                                                     |
| First action        | Prominent prompt field; attachment and microphone controls        | Prompt, project import, agent creation, idea consultant                        | Outcome-based prompt library reduces blank-page anxiety; voice input remains missing                                           |
| Returning users     | My, Published, and Shared projects are visible                    | Recent cards, searchable projects and demo-deployed filter                     | Recent-work visibility improves; shared-project semantics and real published-app inventory are not equivalent                  |
| Learning and rescue | How it works, prompt library, help/support visible                | Features exist but little first-session explanation                            | Getting started explains three steps, decisions, recovery and simulation scope; real support channel still needed              |
| Agent lifecycle     | Agent Studio is a visible destination                             | Blueprint, agent inspector, data, test, release and monitor views              | Clearer prototype journey; not proof of more capability than Agent Studio                                                      |
| Developer entry     | No explicit repo/developer path visible in the screenshot         | Import demo and Developer view                                                 | Real JSON round trip and portable handoff added; no source checkout or executable code workspace                               |
| Framework choice    | Not established by screenshot                                     | Seven named configuration choices                                              | Explicit compatibility table now says execution is not connected for every framework                                           |
| Ownership           | Not established by screenshot                                     | Project/workspace JSON export                                                  | Validated single-project import creates a new draft and preserves existing projects; not a runnable code export                |
| Trust               | Original runtime status cannot be determined from screenshot      | Labels said simulation, but many positive statuses could still imply readiness | Evidence ledger separates five configuration checks from four absent runtime-evidence categories; release links directly to it |
| Costs               | Actual-looking credit balance and credit offer visible            | Sample credits/spend and saved budget                                          | Real metering, estimates and enforcement remain absent; cosmetic budget settings must not be marketed as spend protection      |
| Team use            | Shared projects and organization are visible                      | Demo member records and approvals                                              | No actual collaborative editing or membership enforcement; a material parity gap                                               |
| Ecosystem           | Marketplace visible                                               | Curated templates and agent library                                            | Templates are not a functioning marketplace; publishing, discovery, licensing and trust reviews remain unverified/missing      |
| Authentication      | Not shown by supplied image                                       | Hosting-platform sign-in and per-user persistence                              | Working for this private prototype; not equivalent to a general SaaS signup, SSO or invitation lifecycle                       |

**Parity conclusion:** the requirement to retain all existing Architect features has not been demonstrated. Voice input, organization management, shared projects, marketplace operations, billing, customer support and the depth of Agent Studio are explicit verification gaps. Preserve these as a migration checklist rather than silently calling new template pages replacements.

Lyzr's own current Control Plane documentation already describes external framework imports, Git-driven delivery and staged evaluations. These should inform integration planning, not be claimed as inventions exclusive to 2.0. Their availability inside this particular architect.new account remains unverified. [Lyzr Control Plane](https://www.lyzr.ai/blog/lyzr-agent-control-plane/)

## 3. What works elsewhere—and the real competitive bar

The capability column below is documented; the motivation and product implication are inferred. This is a targeted comparison of relevant differentiators, not “every feature.”

| Platform         | Relevant documented strength                                                                                          | Likely reason users value it                                        | Implication for Architect 2.0                                                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architect / Lyzr | Business-oriented entry in screenshot; broader Lyzr Control Plane documents framework imports and staged Git delivery | Business context with an agent operations path                      | Preserve business simplicity and reuse platform depth where available; do not recreate it as disconnected mockups                                                                                                       |
| Replit           | Agent browser-based app testing and feedback                                                                          | Less manual setup/debugging; confidence from seeing tests execute   | A simulated Test lab is insufficient; provide real run evidence before claiming parity. [App testing](https://docs.replit.com/features/agent/app-testing)                                                               |
| Lovable          | Git export/two-way sync and local-development handoff                                                                 | Fast creation without surrendering code ownership                   | Portability must survive an external edit and return trip. Current JSON portability is a smaller, honest step. [GitHub sync](https://docs.lovable.dev/integrations/github)                                              |
| Emergent         | Existing-repository pull, branch selection, continued editing and push                                                | Continue existing work without starting over                        | Import must establish a real baseline and retain project behavior. Metadata inspection alone cannot win this user. [GitHub integration](https://help.emergent.sh/github-integration)                                    |
| v0               | Visual changes applied back to source as a version; Git branches and review                                           | High visual control plus an engineering-compatible workflow         | Heading/accent editing is much narrower. Build a source-linked design workflow before claiming comparable visual tooling. [Design mode](https://v0.app/docs/design-mode), [Git workflow](https://v0.app/docs/github)    |
| Rocket.new       | Repository import and stack-specific sync behavior                                                                    | A guided path with an escape to GitHub                              | Publish support limits explicitly. Its documentation distinguishes Next.js TypeScript two-way behavior from other frameworks' manual push. [GitHub connector](https://docs.rocket.new/build/connectors/github/overview) |
| Cursor           | Live diff review, stopping/redirecting work, review and testing practices                                             | Familiar editor, control, repository context                        | A code textarea and log sample will not replace an IDE. Start as an adjacent agent-application workflow. [Reviewing and testing](https://cursor.com/learn/reviewing-testing)                                            |
| Codex            | Edit/run/observe/repair loop, repository context and isolated worktrees                                               | Delegation grounded in real execution and reviewable changes        | Prove completion with artifacts and tests, not a generated-looking chat response. [Long-horizon work](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex)                                             |
| Claude Code      | Checkpoint/rewind with documented restoration limits                                                                  | Fast iteration with a recovery path and awareness of its boundaries | Version history must explain exactly what it restores. Keep the current heading/brief limitation explicit. [Checkpointing](https://code.claude.com/docs/en/checkpointing)                                               |

Basic Git integration, planning, templates, visual editing, checkpoints, human review and multi-framework labels are **table stakes or shared patterns**. This research does not establish any individual Architect 2.0 feature as uniquely available in the market.

## 4. User psychology and likely adoption

The central tension is different for each audience: a business builder fears not knowing what to ask; a developer fears losing control of what was changed. Both fear being stranded after the attractive first demo.

| Segment                   | Job and emotional need (hypothesis)                                | What attracts them in 2.0                                       | Why they might leave                                                            | Evidence to collect                                                            |
| ------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Non-technical operator    | Solve a recurring problem without feeling technically inadequate   | Outcome prompts, blueprint, guided preview, explicit next steps | Framework jargon, too many screens, inability to execute a real task            | Can 8/10 participants reach and explain a useful workflow without assistance?  |
| Consultant / agency       | Deliver a repeatable client outcome and hand it over credibly      | Reusable blueprint, agent roles, handoff, evidence export       | Demo invites, no actual client isolation or environment ownership               | Time to client acceptance; ability to transfer and independently run an app    |
| Startup technical founder | Ship quickly while retaining future flexibility                    | Config export, repository path, visible operating boundaries    | No real runtime; cost and debugging uncertainty                                 | Import → meaningful change → passing tests → staging on a real repo            |
| Experienced developer     | Delegate bounded work without abandoning tools or review standards | Transparent contracts, evidence gaps, plain-text handoff        | No terminal, file tree, real diff, branch isolation or deterministic runtime    | Can they find a planted regression, reject it and recover without losing work? |
| Platform / security owner | Govern agent actions across teams                                  | Approval model and separated evidence categories                | No enforced tenant permissions, audit retention, policy engine or secrets vault | Adversarial denied-action and isolation tests; exported provenance audit       |
| Existing Architect user   | Keep familiar productivity while gaining depth                     | Familiar prompt entry plus an optional technical path           | Lost voice, shared projects, marketplace, credits or help flows                 | Moderated migration session using their actual current workflow                |

**Attraction verdict:** credible for an exploratory design-partner session; unproven for paid adoption. The present prototype may attract attention from business users and consultants. It is unlikely to retain experienced builders as their primary development platform until repository work and runtime execution are real.

**Switching strategy:** win one bounded task before asking for a platform switch. Let a developer keep Cursor, Codex or Claude Code and use Architect for business intent, agent contracts, approvals and deployment evidence. The handoff download supports that behavior today, without implying an installed integration.

Avoid reward mechanisms that inflate the wrong behavior: “number of projects created” and “number of green simulated tests” are not measures of delivered user value.

## 5. Owner score: a fair comparison

A complete product-to-product score would be false precision because the authenticated baseline has not been tested. The only directly comparable numeric assessment is a **heuristic of visible entry UX and demonstrated onboarding**, using five equally weighted 0–10 dimensions. Scores are reviewer judgments with low-to-medium confidence, not measured conversion effects.

Anchors: 0 = absent/unusable; 5 = discoverable with significant explanation; 8 = clear and usable with minor friction; 10 = demonstrated to be frictionless in research. A 10 is intentionally unavailable without user evidence.

| Entry-UX dimension              | Base screenshot | Initial 2.0 | Audited 2.0 | Reason                                                                                           |
| ------------------------------- | --------------: | ----------: | ----------: | ------------------------------------------------------------------------------------------------ |
| Intended audience clarity       |               8 |           7 |           9 | Original business audience is explicit; revised paths now distinguish both audiences             |
| First-action clarity            |               8 |           8 |           9 | Prompt remains central, with a clear optional starting path                                      |
| Blank-page support              |               6 |           7 |           9 | Prompt library was a link in base; revised experience gives inspectable outcome prompts          |
| Returning to existing work      |               6 |           8 |           8 | 2.0 shows recent projects; original has project navigation; deeper flows unverified              |
| Technical entry discoverability |               4 |           6 |           8 | Revised technical path exposes portability, contracts and evidence rather than just a mode label |
| **Equal-weight average**        |         **6.4** |     **7.2** |     **8.6** | Five dimensions; no runtime capability implied                                                   |

**Scoped improvement score: +2.2 points out of 10 versus the supplied base entry screen; +1.4 versus the initial prototype.** Do not advertise a percentage uplift, conversion increase or whole-product superiority from these numbers.

Separate assessments:

- **UX concept:** 8.6/10 within the narrow rubric above; suitable for usability research.
- **Full base feature parity:** unverified, with known gaps.
- **Developer replacement value:** not established; current source/runtime limitations are blocking.
- **Public production launch:** no-go until the operational gates below pass. A single blended score must not hide this decision.
- **Commercial demand:** unmeasured. No claim of product–market fit or launch success is justified yet.

## 6. How to make a technical builder comfortable

Design the first ten minutes around evidence and reversibility:

1. Choose “Bring an existing project”; read-only connection first, selected repositories, explicit scopes.
2. Identify the commit, stack, framework/version, package manager, services and unsupported parts. Report unknowns rather than inventing a successful scan.
3. Run an unchanged baseline in an isolated sandbox. Preserve command, exit status and logs.
4. Propose one bounded change with a file-level impact map and test plan.
5. Create a working branch/worktree only when the user starts the change. Preserve custom code, package versions and repository conventions.
6. Show an actual diff, test output and preview. Support selective rejection, interruption and rerun.
7. Open a pull request with the exact commit and evidence. No silent overwrite or automatic merge.
8. Deploy to staging, verify health, and rehearse recovery. Keep database migration reversal separate from code rollback.
9. Export or open the same repository locally; accept external edits through an explicitly tested synchronization model.
10. Show estimated versus actual model/build/runtime spend, run limits, and who approved consequential actions.

The production contract needs a file tree, genuine code editor, terminal output, preview errors, dependency management, secrets vault, environment isolation, framework-version matrix, deterministic commands, evaluation fixtures, artifact provenance and actual Git integration. These are engineering requirements, not additional decorative screens.

The current iteration implements the **configuration portability and handoff** portion. It does not imply the ten-minute production path now works.

## 7. Differentiation that could become defensible

None of these guarantees launch success. Treat them as a combined product thesis to validate.

| Candidate advantage                    | Why it could matter                                                                          | Current truth                                                         | What would make it defensible                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Intent-to-evidence chain               | A business stakeholder can trace a requirement through agent behavior to acceptance evidence | Blueprint and evidence views exist; links are coarse                  | Versioned requirement IDs connected to code changes, tool traces, tests and releases                             |
| Capability passport                    | A developer can evaluate framework, tools, approvals and budget in one place                 | Saved configuration inspector                                         | Versioned adapters, conformance tests and a portable execution contract                                          |
| Business–engineering continuity        | Less requirement translation and rework between roles                                        | Shared local project state plus downloaded handoff                    | Real collaborative review, approvals, comments, provenance and ownership transfer                                |
| Honest readiness ledger                | Prevents a good-looking preview from being mistaken for production proof                     | Real configuration checks; runtime evidence remains explicitly absent | Attested runtime artifacts, freshness/expiry and non-bypassable release gates                                    |
| Framework freedom with declared limits | Choice without misleading compatibility claims                                               | All configured frameworks marked runtime-not-connected                | Start with two tested adapters; publish versioned input/output, tool, memory, streaming and cancellation support |
| Outcome-specific operating templates   | Faster time to repeatable business value                                                     | Support/research/operations starter prompts                           | Real datasets, evaluation packs, failure handling and measured cost per successful task                          |

A moat would come from trustworthy adapters, operational evidence, reusable domain evaluations and a coherent collaboration workflow—not the presence of more menu items.

## 8. Additional audit questions an owner should ask

| Priority | Question                                                              | Current answer / next proof                                                                                           |
| -------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| P0       | What exact event proves first value?                                  | A real customer task completed and accepted, not a project created                                                    |
| P0       | Can users distinguish demo, configured and verified states?           | Improved labels and ledger; test comprehension with participants                                                      |
| P0       | Does “import” actually read a repository and reproduce its baseline?  | No; real JSON configuration import now works, source import remains a demo                                            |
| P0       | Can another tenant see or modify this project's records?              | Per-user API ownership exists; full multi-tenant penetration testing not performed                                    |
| P0       | Are approval policies enforced in tools, not only displayed?          | No production executor; cannot claim enforcement                                                                      |
| P0       | Can an imported prompt or document grant itself permissions?          | No imported code runs; future runtime must treat source content as untrusted and test injection boundaries            |
| P0       | Can the team recover code, data and external side effects separately? | Preview restoration only; production recovery is a blocker                                                            |
| P0       | What stops runaway cost or repeated tool calls?                       | Saved budget definitions only; actual metering and circuit breakers required                                          |
| P0       | Are credentials ever stored in project JSON or exports?               | UI requests no real credentials; variable placeholder value discarded; production needs a vault and redaction         |
| P0       | Which original features disappear on migration?                       | Voice, real sharing/org controls, marketplace, billing/support and Agent Studio depth need explicit parity acceptance |
| P1       | Does the novice get overwhelmed by developer choices?                 | Guided starting path added; measure task completion and help requests                                                 |
| P1       | Can an engineer audit a change without reading the entire chat?       | Handoff and evidence download help; actual diff/provenance still required                                             |
| P1       | Does mobile support decisions or merely shrink a desktop IDE?         | Navigation/approval/configuration flows responsive; validate 200% text zoom and assistive technology separately       |
| P1       | What happens when an API changes or a model returns malformed data?   | Framework adapters, schemas, retry budgets and dead-letter handling required                                          |
| P1       | Can users leave and come back without losing work?                    | Configuration round trip added and tested; source/runtime portability remains open                                    |
| P1       | Is the default team model real?                                       | Demo members do not grant actual access; inviting users must never imply otherwise                                    |
| P1       | Are marketplace templates safe, licensed and maintained?              | Curated demo templates only; ecosystem governance not implemented                                                     |
| P1       | Are unit economics based on successful outcomes?                      | No measured commercial data; instrument retries, model tokens, build minutes and support load                         |
| P2       | Would users recommend it after week four?                             | Unknown; track repeat meaningful use and qualitative reason, not survey enthusiasm alone                              |
| P2       | What can we intentionally omit?                                       | Broad IDE replacement, many untested adapters and a marketplace before the core loop works                            |

## 9. Launch gates, experiments and commercial discipline

### Recommended beachhead

Pilot with teams where a domain expert and a developer jointly own a support or internal-operations agent. This matches the shared-intent/approval thesis and offers observable tasks. Avoid a first launch across healthcare, finance, autonomous payments and arbitrary software generation simultaneously.

### Proposed acceptance targets—not measured results

| Gate                | Test                                                                           | Proposed bar                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Comprehension       | 10 target participants explain configured versus executed versus verified      | At least 9 correctly distinguish all three before release actions                                                     |
| Novice activation   | Moderated outcome → blueprint → preview task                                   | At least 8/10 complete unaided; median under 10 minutes; compare against base                                         |
| Developer trust     | 10 developers import a supported real repository and review one bounded change | At least 8/10 complete; every changed file attributable; no unintended source loss                                    |
| Runtime correctness | Versioned evaluation fixtures including missing sources and denied actions     | All critical safety assertions pass; task-quality threshold agreed by domain owners before testing                    |
| Recovery            | Staging failure, provider outage, interrupted build and data migration drill   | Recovery demonstrated within the team's stated objective; no undocumented data loss                                   |
| Retention           | Small consented design-partner cohort over four weeks                          | At least 60% of activated teams repeat a meaningful workflow in week four; directional, not statistical proof         |
| Commercial intent   | Pricing interviews plus paid pilot offers after real value                     | Evidence of willingness to pay from at least 3 independent teams; do not treat a hypothetical survey “yes” as revenue |
| Unit economics      | Measure cost per accepted successful task including retries/support            | Positive contribution margin at the pilot price and an explicit limit for outlier runs                                |

Counterbalance the order of base and 2.0 in usability sessions to reduce learning bias. Use matched tasks and the same underlying runtime where possible. Record completion, time, errors, help requests, trust comprehension and abandonment. Separate first-session novelty from week-four utility.

Do not send invitations or collect personal telemetry without the appropriate user-facing consent. This audit did not contact users or send any communications.

### Build sequence

**Phase 1 — validate the experience:** the improvements in this release, moderated comparison, baseline feature-parity walkthrough and explicit supported use case. Gate: no critical comprehension failures.

**Phase 2 — one trustworthy vertical slice:** one real import path, Lyzr plus one external framework adapter if feasible, sandbox execution, actual diff/tests, tool approval enforcement, staging and recovery. Gate: repeatable end-to-end evidence on real projects.

**Phase 3 — dependable collaboration:** organization roles, isolated environments, audit retention, client handoff, metering, incident handling and service objectives. Gate: paid design partners operate without constant concierge rescue.

**Phase 4 — expand selectively:** additional adapters and marketplace only after the conformance and evaluation system can hold them to the same standard.

Timelines should be estimated by the implementing team after the runtime/API integration spike; no unsupported delivery-date promise is made here.

## 10. What was improved in this iteration

- Added **Getting started** with Business and Technical builder paths, an outcome prompt library, a three-step journey and explicit expectations.
- Added **Project portability**: select a human-readable project name; download a versioned project JSON or engineering handoff; validate a project file before restoring it as a separate draft.
- Import preserves existing projects, assigns new project/agent identities, clears copied deployment history and resets scenario results so imported claims are not treated as current evidence.
- Added **Evidence & readiness**: five derived configuration checks, four explicitly unverified runtime-evidence categories, an honest framework matrix and downloadable evidence ledger.
- Linked release screens to the ledger and changed readiness wording to simulation/configuration language.
- Clarified the Lyzr configuration label so it does not imply a connected runtime.
- Exposed the new paths in navigation and the home screen instead of burying limitations and handoff controls in a footer.

The changes deliberately improve a small number of important journeys rather than promising additional nonfunctional integrations.

## 11. Verification and limitations

The previous prototype had 39 real browser/API checks, 16 responsive screens and a 16-screen axe scan. Those were checks of the prototype—not proof of generated applications working. The updated prototype passed 39 existing regression assertions and 24 audit assertions (63 total), with zero automated axe violations across 19 screens and 19 mobile-width checks. See the accompanying audit validation record for coverage and limitations.

The audit did not verify every paid feature or authenticated workflow of every competitor. The original Architect's runtime performance, availability, pricing economics and team permissions remain unmeasured. Vendor documentation is not a substitute for an apples-to-apples benchmark. No market-share, conversion, productivity percentage or guaranteed launch-success claim is supported.

**Final owner recommendation:** continue investing in the business-to-engineering evidence chain. Ship this as a clearly labeled private prototype, validate the adoption hypotheses, and earn production trust through one real execution-and-recovery loop before expanding the feature list.
