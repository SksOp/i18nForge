import NextAuth, { Account, Profile, User } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { PrismaClient } from '@prisma/client'

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error("GITHUB_ID and GITHUB_SECRET must be set");
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    githubId?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    githubId?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    username?: string | null;
  }
}

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }: { token: JWT; account: Account | null; profile?: Profile; user?: User }): Promise<JWT> {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          githubId: account.providerAccountId,
          email: user.email,
          name: user.name,
          image: user.image,
          username: (profile as any)?.login || null,
        };
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {

      const data = {
        ...session,
        accessToken: token.accessToken,
        githubId: token.githubId,
        email: token.email,
        name: token.name,
        image: token.image,
        username: token.username,
      };

      const user = await prisma.user.findUnique({
        where: {
          email: token.email || '',
        },
      });

      if (!user && token.email) {
        await prisma.user.create({
          data: {
            email: token.email,
            name: token.name || null,
            username: token.username || null,
            image: token.image || null,
            accessToken: token.accessToken || null,
            githubId: token.githubId || null
          }
        });
      }
      return data;
    },
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };