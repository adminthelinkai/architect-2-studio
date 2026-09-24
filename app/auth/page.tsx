import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Auth() {
  const user = await getChatGPTUser();
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <span className="brandmark">a</span> architect <small>2.0</small>
      </div>
      <section className="auth-card">
        <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1>
          Make room for
          <br />
          <em>your next idea.</em>
        </h1>
        <p>
          One connected workspace for your apps, agents, and everything in
          between.
        </p>
        <a
          className="btn primary"
          href={user ? "/" : chatGPTSignInPath("/")}
          target="_top"
        >
          {user ? "Open your workspace" : "Continue with ChatGPT"} →
        </a>
        <small>Secure sign-in and a private, saved workspace.</small>
        <div className="notice">
          Google, GitHub, and enterprise SSO are planned identity options. This
          prototype uses platform sign-in.
        </div>
      </section>
      <footer>Your code. Your data. Always yours.</footer>
    </main>
  );
}
