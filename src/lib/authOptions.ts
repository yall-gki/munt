import { db } from "@/lib/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { verifyPassword } from "@/lib/password";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const valid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!valid || !user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
          username: user.username ?? undefined,
          emailVerified: user.emailVerified ?? undefined,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        if (!profile.email) {
          throw new Error("Google account has no email");
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email.toLowerCase(),
          image: profile.picture,
        };
      },
    }),

    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  /**
   * ✅ DB-safe place to mark OAuth users as verified
   */
  events: {
    async createUser({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username ?? null;
        token.emailVerified = user.emailVerified
          ? new Date(user.emailVerified).toISOString()
          : null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = (token as any)?.username ?? null;
        session.user.emailVerified = token.emailVerified
          ? new Date(token.emailVerified as string)
          : null;
      }
      return session;
    },
  },
};
