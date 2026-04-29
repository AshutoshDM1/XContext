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
    title: 'SuperTeam x 100xDevs March Bounty Contest',
    shortDescription:
      'Build 3 projects — an address book, a PDA registry, and a multi-sig vault — testing your understanding of wallets, PDAs, and private keys.',
    topbarDescription:
      'Build 3 projects — an address book, a PDA registry, and a multi-sig vault — testing your understanding of wallets, PDAs, and private keys.',
    status: 'ENDED',
    participantCount: 427,
    timeLabel: '08:34 PM – 10:34 PM',
  },
  {
    userId: SEED_USER_ID,
    title: 'PDA Registry Sprint',
    shortDescription:
      'Register and resolve Program Derived Addresses with seeds, bump validation, and a minimal explorer UI.',
    topbarDescription:
      'Register PDAs with canonical bumps, resolve by program + seeds, and expose a read-only JSON API.',
    status: 'LIVE',
    participantCount: 128,
    timeLabel: 'Live now',
  },
  {
    userId: SEED_USER_ID,
    title: 'Multi-sig Vault Lab',
    shortDescription:
      'Simulate a vault with M-of-N signers, proposal queue, and execution deadlines.',
    topbarDescription:
      'M-of-N proposals, timelock execution, and replay protection for off-chain signed intents.',
    status: 'ENDED',
    participantCount: 89,
    timeLabel: 'Mar 12 – Mar 19',
  },
  {
    userId: SEED_USER_ID,
    title: 'JS Promise Orchestrator ',
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
