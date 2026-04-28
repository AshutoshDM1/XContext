import { relations } from 'drizzle-orm';
import { integer, pgTable, timestamp, jsonb, text, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const code = pgTable(
  'code',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    code: jsonb('code').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('code_userId_idx').on(table.userId)],
);

export const codeRelations = relations(code, ({ one }) => ({
  user: one(user, {
    fields: [code.userId],
    references: [user.id],
  }),
}));

export const contest = pgTable(
  'contest',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    shortDescription: text('short_description').notNull(),
    topbarDescription: text('topbar_description'),
    status: text('status').notNull().default('LIVE'),
    participantCount: integer('participant_count').notNull().default(0),
    timeLabel: text('time_label').notNull(),
    projects: jsonb('projects').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('contest_userId_idx').on(table.userId)],
);

export const contestRelations = relations(contest, ({ one }) => ({
  user: one(user, {
    fields: [contest.userId],
    references: [user.id],
  }),
}));
