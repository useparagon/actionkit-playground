import { userWithToken } from "@/app/(auth)/auth";
import { getChatsByUserId, getUser } from "@/db/queries";

export async function GET() {
  const session = await userWithToken();
  if (!session || !session.user) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  const user = await getUser(session.user.email);
  if (user.length === 0) {
    return Response.json("No user found", { status: 500 });
  }

  const chats = await getChatsByUserId({ id: user[0].id });
  return Response.json(chats);
}
