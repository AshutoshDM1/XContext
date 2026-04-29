import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from './db';
import { origins } from './origins';

const isProduction = process.env.BETTER_AUTH_URL === 'https://xcontext-backend.elitedev.space';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  url: process.env.BETTER_AUTH_URL,
  baseURL: {
    allowedHosts: origins,
  },
  trustedOrigins: origins,
  advanced: {
    useSecureCookies: isProduction,
    crossSubDomainCookies: {
      enabled: isProduction,
      domain: `elitedev.space`,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    fetchUser: async (userId: string) => {
      const result = await db.query.user.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      });
      return result || null;
    },
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        required: false,
        fieldName: 'admin',
      },
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

  onError: (error: any) => {
    console.error('Better Auth Error:', error.message);
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
