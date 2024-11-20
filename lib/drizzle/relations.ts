import { relations } from "drizzle-orm/relations";
import { user, chat } from "./schema";

export const chatRelations = relations(chat, ({one}) => ({
	user: one(user, {
		fields: [chat.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	chats: many(chat),
}));