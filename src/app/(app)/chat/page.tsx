import { redirect } from "next/navigation";

import { ChatClient } from "./chat-client";
import { getProfile } from "@/lib/profile";

export default async function ChatPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");
  return <ChatClient />;
}
