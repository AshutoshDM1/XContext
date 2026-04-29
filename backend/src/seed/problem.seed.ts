import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import db from '@/utils/db';
import { contest, project } from '@/db/schema';

const SEED_USER_ID = '6yjaFy0Cmi4Y5CciAwC0bmBagpcizFVY';

const CONTEST_TITLE = 'JS Promise Orchestrator ';

const projectsData = [
  {
    projectId: 'promise-orchestrator-solo',
    problemMarkdown: `# Notes

# Promise Orchestrator (Hard)

Build a system that manages multiple asynchronous tasks using **JavaScript Promises**.

Support:

- Parallel execution
- Sequential chaining
- Retry failed tasks
- Concurrency limits
- Timeout cancellation
- Aggregate results

## API Sketch

\`POST /api/tasks/run-all\` — Execute all tasks in parallel using Promise.all()

\`POST /api/tasks/run-sequence\` — Execute tasks one after another

\`POST /api/tasks/run-race\` — Return first completed task using Promise.race()

\`POST /api/tasks/run-limited\` — Run tasks with max concurrency limit

\`POST /api/tasks/:id/retry\` — Retry failed task up to N attempts

\`POST /api/tasks/:id/cancel\` — Cancel task using AbortController

## Rules

- Return **408** for timed out tasks
- Return **409** for duplicate running tasks
- Return **500** if all retries fail
- Preserve execution logs with timestamps
- Prevent memory leaks from unresolved promises

## Bonus

Implement your own \`Promise.allSettled()\` polyfill and task scheduler.`,
  },
  {
    projectId: 'Async Number Doubler (Easy)',
    problemMarkdown: `# Async Number Doubler (Easy)

Write a function using **async/await** that waits for 1 second and returns double the given number.

## Requirements

- Create an async function \`doubleNumber(num)\`
- Use \`await\` with a Promise
- Return \`num * 2\` after 1 second
- Print the result in console

## Example

Input: \`5\`

Output: \`10\`

## Bonus

Call the function two times with different numbers.`,
  },
] as const;

async function seed() {
  console.log('🌱 Seeding problems/projects...');

  const c = await db.query.contest.findFirst({
    where: and(eq(contest.userId, SEED_USER_ID), eq(contest.title, CONTEST_TITLE)),
  });

  if (!c) {
    throw new Error(`Contest not found for seed: userId=${SEED_USER_ID}, title=${CONTEST_TITLE}`);
  }

  let insertedCount = 0;

  for (const p of projectsData) {
    const exists = await db.query.project.findFirst({
      where: and(eq(project.contestId, c.id), eq(project.projectId, p.projectId)),
    });
    if (exists) continue;

    await db.insert(project).values({
      contestId: c.id,
      projectId: p.projectId,
      problemMarkdown: p.problemMarkdown,
    });
    insertedCount += 1;
  }

  console.log(`✅ Seeded ${insertedCount} problems into contestId=${c.id}`);
}

seed()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
