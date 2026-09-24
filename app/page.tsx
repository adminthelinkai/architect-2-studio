import Workbench from "@/components/architect/workbench";
import { getChatGPTUser } from "./chatgpt-auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getChatGPTUser();
  if (!user) redirect("/auth");
  return <Workbench user={{ name: user.displayName, email: user.email }} />;
}
