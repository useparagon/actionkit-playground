"server-only";

import { createClient } from "@libsql/client";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { user, chat, User } from "./schema";

const db = drizzle(
  createClient({
    url: "file:./db.sqlite",
  })
);

export const STATIC_USER = {
  id: "playground.local-static-user",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  email: "static-user@actionkit.playground",
  firstName: "Test",
  lastName: "User",
  emailVerified: true,
  profilePictureUrl: null,
  object: "user",
};

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database", error);
    throw error;
  }
}

export async function createUser(
  email: string,
  password: string,
  externalId?: string
) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash, externalId });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  email,
  systemPrompt,
  tools = [],
  modelName,
  modelProvider,
}: {
  id: string;
  messages: any;
  email: string;
  systemPrompt: string;
  tools: { name: string }[];
  modelName: string;
  modelProvider: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));
    let user = await getUser(email);
    if (!user || user.length === 0) {
      if (email === STATIC_USER.email && process.env.ENABLE_AUTH === "false") {
        await createUser(email, "static-user-password", STATIC_USER.id);
        user = await getUser(email);
      } else {
        throw new Error("Could not find user");
      }
    }

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages,
          systemPrompt,
          tools: tools.map((tool) => tool.name),
          modelName,
          modelProvider,
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages,
      userId: user[0].id,
      modelName,
      modelProvider,
      systemPrompt,
      tools: tools.map((tool) => tool.name),
    });
  } catch (error) {
    console.error("Failed to save chat in database", error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}
