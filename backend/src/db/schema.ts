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
