import 'dotenv/config';
import db from '@/utils/db';
import { contest } from '@/db/schema';

const SEED_USER_ID = '6yjaFy0Cmi4Y5CciAwC0bmBagpcizFVY'; // Replace with actual user ID from your database

const contestsData = [
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
    projects: [
      {
        projectId: 'solana-address-book',
        problemMarkdown: `# Solana Address Book (Easy)

Build a REST API for managing Solana addresses. Detect whether each address is a **wallet** or a **PDA**, and verify ownership where applicable.

## Requirements

- Persist contacts in a database or in-memory store (your choice for the bounty).
- Validate Solana address format before accepting a contact.

## Contacts CRUD

\`POST /api/contacts\` — Add a contact

**Body:** \`{ "name": string, "address": string }\`

**Response 201:** \`{ "id": number, "name": string, "address": string, "type": "wallet" | "pda", "createdAt": string }\`

\`GET /api/contacts\` — List contacts

**Query param:** \`?type=wallet\` or \`?type=pda\` to filter by detected type.

\`GET /api/contacts/:id\` — Fetch one contact

\`PATCH /api/contacts/:id\` — Update name or address (re-validate on address change)

\`DELETE /api/contacts/:id\` — Remove a contact

## Edge cases

- Reject invalid base58 / wrong length addresses with **400**.
- If the same address is submitted twice, return **409** or upsert — document your choice in the README.`,
      },
      {
        projectId: 'pda-registry',
        problemMarkdown: `# PDA Registry (Medium)

Implement a service that registers PDAs for a fixed program id. Store **program id**, **seeds** (as byte arrays or base64), **bump**, and **derived address**.

## Endpoints

\`POST /api/pdas\` — Register a PDA (must verify bump is canonical)

\`GET /api/pdas?program=\` — List PDAs for a program

\`GET /api/pdas/:address\` — Lookup by derived address

## Requirements

- Canonical bump check on every registration.
- Return **404** when no record exists.`,
      },
      {
        projectId: 'multisig-vault',
        problemMarkdown: `# Multi-sig Vault (Hard)

Model a vault with **M-of-N** approvers. Support **create proposal**, **approve**, **execute**, and **cancel** flows.

## API sketch

\`POST /api/vaults\` — Create vault with signer pubkeys and threshold M

\`POST /api/vaults/:id/proposals\` — Create transfer proposal

\`POST /api/vaults/:id/proposals/:pid/approve\` — Record approval from a signer

\`POST /api/vaults/:id/proposals/:pid/execute\` — Execute when threshold met and timelock elapsed

Return **403** for unauthorized signers and **409** for invalid state transitions.`,
      },
    ],
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
    projects: [
      {
        projectId: 'pda-registry-project-1',
        problemMarkdown: `# PDA Registry (Medium)

Implement a service that registers PDAs for a fixed program id. Store **program id**, **seeds** (as byte arrays or base64), **bump**, and **derived address**.

## Endpoints

\`POST /api/pdas\` — Register a PDA (must verify bump is canonical)

\`GET /api/pdas?program=\` — List PDAs for a program

\`GET /api/pdas/:address\` — Lookup by derived address

## Requirements

- Canonical bump check on every registration.
- Return **404** when no record exists.`,
      },
    ],
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
    projects: [
      {
        projectId: 'multisig-vault-solo',
        problemMarkdown: `# Multi-sig Vault (Hard)

Model a vault with **M-of-N** approvers. Support **create proposal**, **approve**, **execute**, and **cancel** flows.

## API sketch

\`POST /api/vaults\` — Create vault with signer pubkeys and threshold M

\`POST /api/vaults/:id/proposals\` — Create transfer proposal

\`POST /api/vaults/:id/proposals/:pid/approve\` — Record approval from a signer

\`POST /api/vaults/:id/proposals/:pid/execute\` — Execute when threshold met and timelock elapsed

Return **403** for unauthorized signers and **409** for invalid state transitions.`,
      },
    ],
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
