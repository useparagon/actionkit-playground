import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";
import { auth, ExtendedSession, userWithToken } from "../(auth)/auth";

export default async function Page() {
  const id = generateUUID();
  const session = await userWithToken();
  return (
    <Chat
      session={session}
      key={id}
      id={id}
      initialMessages={[]}
    />
  );
}
