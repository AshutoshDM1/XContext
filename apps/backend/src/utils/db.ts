import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as authSchema from '../db/auth-schema';
import * as appSchema from '../db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({
  client: sql,
  schema: { ...authSchema, ...appSchema },
});

export default db;
