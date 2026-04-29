import { createAuthClient } from 'better-auth/react';

// For cross-subdomain auth to work, we need direct backend requests
// The proxy approach doesn't preserve Set-Cookie headers correctly

export const authClient = createAuthClient({
  baseURL: '', // Direct backend in prod, proxy in dev
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include', // Include cookies in cross-origin requests
  },
});

export const { signIn, signOut, useSession, signUp } = authClient;
