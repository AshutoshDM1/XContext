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

export const codeSubmission = pgTable(
  'code_submission',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    code: jsonb('code').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    projectId: integer('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('code_submission_userId_idx').on(table.userId),
    index('code_submission_projectId_idx').on(table.projectId),
    index('code_submission_userId_projectId_idx').on(table.userId, table.projectId),
    uniqueIndex('code_submission_userId_projectId_sequence_uidx').on(
      table.userId,
      table.projectId,
      table.sequence,
    ),
  ],
);

export const codeSubmissionRelations = relations(codeSubmission, ({ one }) => ({
  user: one(user, {
    fields: [codeSubmission.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [codeSubmission.projectId],
    references: [project.id],
  }),
}));

export const interview = pgTable(
  'interview',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: text('status')
      .notNull()
      .default('PENDING')
      .$type<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>(),
    startedAt: timestamp('started_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('interview_userId_idx').on(table.userId)],
);

export const interviewRelations = relations(interview, ({ one, many }) => ({
  user: one(user, {
    fields: [interview.userId],
    references: [user.id],
  }),
  interviewProjects: many(interviewProject),
  questionAnswers: many(interviewQuestionAnswer),
}));

export const interviewProject = pgTable(
  'interview_project',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    interviewId: integer('interview_id')
      .notNull()
      .references(() => interview.id, { onDelete: 'cascade' }),
    projectId: integer('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    latestCodeSubmissionId: integer('latest_code_submission_id')
      .notNull()
      .references(() => codeSubmission.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('interview_project_interviewId_idx').on(table.interviewId),
    index('interview_project_projectId_idx').on(table.projectId),
    index('interview_project_latestCodeSubmissionId_idx').on(table.latestCodeSubmissionId),
    uniqueIndex('interview_project_interviewId_projectId_uidx').on(
      table.interviewId,
      table.projectId,
    ),
  ],
);

export const interviewProjectRelations = relations(interviewProject, ({ one }) => ({
  interview: one(interview, {
    fields: [interviewProject.interviewId],
    references: [interview.id],
  }),
  project: one(project, {
    fields: [interviewProject.projectId],
    references: [project.id],
  }),
  latestCodeSubmission: one(codeSubmission, {
    fields: [interviewProject.latestCodeSubmissionId],
    references: [codeSubmission.id],
  }),
}));

export const interviewQuestionAnswer = pgTable(
  'interview_question_answer',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    interviewId: integer('interview_id')
      .notNull()
      .references(() => interview.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull(),
    question: text('question').notNull(),
    answer: text('answer'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('interview_question_answer_interviewId_idx').on(table.interviewId),
    uniqueIndex('interview_question_answer_interviewId_sequence_uidx').on(
      table.interviewId,
      table.sequence,
    ),
  ],
);

export const interviewQuestionAnswerRelations = relations(interviewQuestionAnswer, ({ one }) => ({
  interview: one(interview, {
    fields: [interviewQuestionAnswer.interviewId],
    references: [interview.id],
  }),
}));
