import {
  sqliteTable,
  text,
  integer,
  blob,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { v4 } from "uuid";

export const user = sqliteTable("User", {
  id: text("id").notNull().primaryKey().$defaultFn(v4),
  email: text("email").notNull(),
  password: text("password"),
});

export const chat = sqliteTable(
  "Chat",
  {
    id: text("id").notNull().primaryKey().$defaultFn(v4),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    messages: blob("messages", { mode: "json" }).notNull(),
    userId: text("userId").notNull(),
  },
  (table) => {
    return {
      // For foreign keys in SQLite, the recommended Drizzle approach:
      chatUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Chat_userId_User_id_fk",
      }),
    };
  }
);
