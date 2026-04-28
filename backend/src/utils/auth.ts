import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from './db';

const ORIGINS = process.env.FRONTEND_URL?.split(',').filter(Boolean) as string[];

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  url: process.env.BETTER_AUTH_URL,
  baseURL: {
    allowedHosts: ORIGINS,
    fallback: process.env.FRONTEND_URL,
  },
  trustedOrigins: ORIGINS,
  socialProviders: {
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  onError: (error: any) => {
    console.error(error.message);
    return {
      status: 'error',
      message: error.message,
      redirect: process.env.FRONTEND_URL,
    };
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
});
