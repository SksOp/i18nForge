import { Account, Profile, User } from 'next-auth';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GithubProvider from 'next-auth/providers/github';

import prisma from '@/lib/prisma';

import { EmailService } from '../../contributor/invite/email/email.core';
import { emailWelcomeTemplate } from '../../contributor/invite/email/email.template';

if (!process.env.GITHUB_OAUTH_ID || !process.env.GITHUB_OAUTH_SECRET) {
  throw new Error('GITHUB_OAUTH_ID and GITHUB_OAUTH_SECRET must be set');
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    githubId: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    username?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    githubId: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    username?: string | null;
  }
}

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_OAUTH_ID,
      clientSecret: process.env.GITHUB_OAUTH_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email read:org repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account; profile: Profile }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            githubId: account.providerAccountId.toString(),
          },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: user.name || null,
              image: user.image || null,
              username: (profile as { login: string }).login,
              accessToken: account?.access_token || null,
              githubId: account?.providerAccountId,
              email: user.email ?? null,
              tokenExpiresAt: account?.expires_at ? new Date(account.expires_at * 1000) : null,
            },
          });

          // send mail to the user
          await new EmailService().sendEmail({
            to: user.email,
            subject: 'Welcome to i18nForge',
            html: emailWelcomeTemplate(user.name),
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({
      token,
      account,
      profile,
      user,
    }: {
      token: JWT;
      account: Account | null;
      profile?: Profile;
      user?: User;
    }): Promise<JWT> {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          githubId: account.providerAccountId,
          email: user.email,
          name: user.name,
          image: user.image,
          username: (profile as unknown as { login: string })?.login || null,
        };
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      return {
        ...session,
        accessToken: token.accessToken,
        githubId: token.githubId,
        email: token.email,
        name: token.name,
        image: token.image,
        username: token.username,
      };
    },
  },
};

export const getUser = async (githubId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      githubId,
    },
  });
  return user;
};
