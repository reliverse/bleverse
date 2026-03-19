import { boolean, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    repoProvider: text("repo_provider"),
    repoOwner: text("repo_owner"),
    repoName: text("repo_name"),
    repoUrl: text("repo_url"),
    repoLinkedAt: timestamp("repo_linked_at"),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("project_owner_id_idx").on(table.ownerId),
    uniqueIndex("project_owner_slug_uidx").on(table.ownerId, table.slug),
  ],
);
