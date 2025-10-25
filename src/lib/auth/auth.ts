/**
 * NextAuth.js v5 Main Configuration
 * 
 * Handles authentication, token management, and session management
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { refreshAccessToken } from './token-refresh';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          tokenExpiry: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          microsoftId: profile.sub,
          id: profile.sub,
          email: profile.email,
          name: profile.name,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.tokenExpiry as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      try {
        const refreshedToken = await refreshAccessToken(token.refreshToken as string);
        
        return {
          ...token,
          accessToken: refreshedToken.accessToken,
          tokenExpiry: refreshedToken.expiresAt,
          error: undefined,
        };
      } catch (error) {
        console.error('Error refreshing access token:', error);
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.microsoftId = token.microsoftId as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
});

