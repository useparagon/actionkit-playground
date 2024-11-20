import { CoreMessage } from "ai";
import { notFound } from "next/navigation";

import { auth, ExtendedSession } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById, getUser } from "@/db/queries";
import { Chat } from "@/db/schema";
import { convertToUIMessages, generateUUID } from "@/lib/utils";

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // type casting
  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  const user = await getUser(session.user.email);
  if (user.length === 0) {
    return notFound();
  }

  if (user[0].id !== chat.userId) {
    return notFound();
  }

  return (
    <PreviewChat
      session={session}
      id={chat.id}
      savedPrompt={chat.systemPrompt}
      savedTools={chat.tools as string[]}
      initialMessages={chat.messages}
    />
  );
}
