import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Auth() {
  const user = await getChatGPTUser();
  return (
    <main className="auth-page refined-auth">
      <div className="auth-brand">
        <span className="brandmark">a</span> architect <small>2.0</small>
      </div>
      <div className="auth-layout">
        <section className="auth-card">
          <span className="eyebrow">ONE PROJECT. EVERY PERSPECTIVE.</span>
          <h1>
            Build AI agents and apps
            <br />
            <em>from one workspace.</em>
          </h1>
          <p>
            Business intent becomes a plan. Agents turn the plan into structured
            work. Developers inspect, refine and ship — with the same context.
          </p>
          <div className="auth-ctas">
            <a
              className="btn primary"
              href="/demo#project/support-copilot/build"
            >
              Try Demo →
            </a>
            <a
              className="btn"
              href={user ? "/" : chatGPTSignInPath("/")}
              target="_top"
            >
              {user ? "Open your workspace" : "Continue with ChatGPT"}
            </a>
          </div>
          <small>
            No sign-in needed for the demo. Sign in for a private, saved
            workspace.
          </small>
          <p className="auth-tour">
            Your two-minute tour: add a publishing approval → inspect the agents
            → switch to Developer → review and ship.
          </p>
        </section>
        <section
          className="product-story"
          aria-label="Connected project preview"
        >
          <header>
            <span className="status-dot green" />
            <b>Support Copilot</b>
            <span>Shared workspace</span>
          </header>
          <div className="story-intent">
            <small>BUSINESS INTENT</small>
            <h2>“Add an approval step before publishing.”</h2>
          </div>
          <div className="story-chain">
            <div>
              <span>01 / PLAN</span>
              <b>Approval requirement</b>
              <p>Human review before every release.</p>
            </div>
            <div>
              <span>02 / AGENTS</span>
              <b>Response → Reviewer</b>
              <p>Draft output waits for approval.</p>
            </div>
            <div>
              <span>03 / DEVELOPER</span>
              <b>Inspect the same change</b>
              <code>requiresHumanApproval: true</code>
            </div>
          </div>
          <footer>
            <span>Preview updated · change ready for review</span>
            <a href="/demo#project/support-copilot/build">
              Explore this project ↗
            </a>
          </footer>
          <small className="story-caption">
            Interactive product prototype · generation, Git sync and releases
            are simulated.
          </small>
        </section>
      </div>
      <footer>Your intent. Your agents. Your code.</footer>
    </main>
  );
}
