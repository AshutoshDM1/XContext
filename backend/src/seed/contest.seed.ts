import 'dotenv/config';
import db from '@/utils/db';
import { contest } from '@/db/schema';

const SEED_USER_ID = '6yjaFy0Cmi4Y5CciAwC0bmBagpcizFVY'; // Replace with actual user ID from your database

// NOTE: seed contests only (0 projects for now)
const contestsData: Array<{
  userId: string;
  title: string;
  shortDescription: string;
  topbarDescription: string;
  status: 'LIVE' | 'ENDED';
  participantCount: number;
  timeLabel: string;
  createdAt?: Date;
  updatedAt?: Date;
}> = [
  {
    userId: SEED_USER_ID,
    title: 'JS Promise Orchestrator Contest',
    shortDescription:
      'Master JavaScript promises with retries, concurrency limits, chaining, and failure recovery.',
    topbarDescription:
      'Build robust async systems using Promise.all, race, retries, queues, cancellation, and timeout handling.',
    status: 'LIVE',
    participantCount: 10,
    timeLabel: 'Apr 01 – Apr 08',
    createdAt: new Date('2026-04-29T09:00:17.782Z'),
    updatedAt: new Date('2026-04-29T12:55:28.897Z'),
  },
];

async function seed() {
  try {
    console.log('🌱 Seeding contests...');

    const inserted = await db.insert(contest).values(contestsData).returning();

    console.log(`✅ Successfully seeded ${inserted.length} contests`);
    console.log(
      'Contest IDs:',
      inserted.map((c) => c.id),
    );
  } catch (error) {
    console.error('❌ Error seeding contests:', error);
    throw error;
  }
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
