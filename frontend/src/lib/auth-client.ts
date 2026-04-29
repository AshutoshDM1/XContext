import { createAuthClient } from 'better-auth/react';

// For cross-subdomain auth to work, we need direct backend requests
// The proxy approach doesn't preserve Set-Cookie headers correctly

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || '', // Use direct backend URL
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include', // Include cookies in cross-origin requests
  },
});

export const { signIn, signOut, useSession, signUp } = authClient;
