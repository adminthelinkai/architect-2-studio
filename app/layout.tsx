import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Architect 2.0 — Build with intent",
  description:
    "Your connected studio for agentic applications. Plan, build, test and deploy, with control at every depth.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
