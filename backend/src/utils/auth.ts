import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from './db';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  url: process.env.BETTER_AUTH_URL,
  baseURL: {
    // allowedHosts expects hostnames (no protocol)
    allowedHosts: [
      'localhost:3000',
      'localhost:3001',
      'x-context.vercel.app',
      '*.vercel.app',
      'xcontext-backend.elitedev.space',
      'xcontext.elitedev.space',
    ],
    fallback: process.env.BETTER_AUTH_URL,
  },
  trustedOrigins: [
    process.env.FRONTEND_URL as string,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://x-context.vercel.app',
    'https://xcontext.elitedev.space',
  ].filter(Boolean) as string[],
  advanced: {
    // In production your frontend (vercel.app) and backend (elitedev.space) are cross-site.
    // To persist the temporary OAuth state cookie set during the sign-in request,
    // it must be a Secure cross-site cookie (SameSite=None; Secure).
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
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
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
});
