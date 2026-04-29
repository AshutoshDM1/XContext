import { relations } from 'drizzle-orm';
import { integer, pgTable, timestamp, jsonb, text, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const code = pgTable(
  'code',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    projectId: integer('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    code: jsonb('code').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('code_userId_idx').on(table.userId),
    index('code_projectId_idx').on(table.projectId),
    uniqueIndex('code_userId_projectId_uidx').on(table.userId, table.projectId),
  ],
);

export const codeRelations = relations(code, ({ one }) => ({
  user: one(user, {
    fields: [code.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [code.projectId],
    references: [project.id],
  }),
}));

export const project = pgTable(
  'project',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    projectId: text('project_id').notNull(),
    problemMarkdown: text('problem_markdown').notNull(),
    contestId: integer('contest_id')
      .notNull()
      .references(() => contest.id, { onDelete: 'cascade' }),
  },
  (table) => [index('project_contestId_idx').on(table.contestId)],
);

export const projectRelations = relations(project, ({ one, many }) => ({
  contest: one(contest, {
    fields: [project.contestId],
    references: [contest.id],
  }),
  codes: many(code),
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
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('contest_userId_idx').on(table.userId)],
);

export const contestRelations = relations(contest, ({ one, many }) => ({
  user: one(user, {
    fields: [contest.userId],
    references: [user.id],
  }),
  projects: many(project),
}));
