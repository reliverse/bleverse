import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const githubConnection = pgTable(
  "github_connection",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ownerType: text("owner_type").notNull(), // user | org
    ownerLogin: text("owner_login").notNull(),
    ownerId: text("owner_id"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("github_connection_user_id_idx").on(table.userId),
    uniqueIndex("github_connection_user_owner_uidx").on(table.userId, table.ownerType, table.ownerLogin),
  ],
);
