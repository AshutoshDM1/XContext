import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // Use same-origin `/api/auth/*` which is rewritten to the backend in `next.config.ts`.
  // This avoids third-party cookie issues in production (state/session cookies become first-party).
  baseURL: '',
  basePath: '/api/auth',
});

export const { signIn, signOut, useSession, signUp } = authClient;
