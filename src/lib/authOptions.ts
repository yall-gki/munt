import { db } from "@/lib/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { verifyPassword } from "@/lib/password";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials?.email);
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const user = await db.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: "insensitive" } },
        });
        if (!user || !user.password) {
          console.log("Authorize failed: user not found or no password");
          return null;
        }
      
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          console.log("Authorize failed: invalid password");
          return null;
        }
      
        if (!(user.emailVerified instanceof Date)) {
          console.log("Authorize failed: email not verified");
          throw new Error("EMAIL_NOT_VERIFIED");
        }
      
        console.log("Authorize successful for user:", user.id);
        return user;
      }
      ,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("SignIn callback:", { user, account });
    
      if (account?.provider !== "credentials") {
        if (!user?.email) return false;
    
        const existingUser = await db.user.findUnique({ where: { email: user.email } });
        if (existingUser) {
          const providerAccountId = account.providerAccountId || account.id;
          if (!providerAccountId) {
            console.log("Missing providerAccountId, cannot link account");
            return false;
          }
          await db.account.upsert({
            where: { provider_providerAccountId: { provider: account.provider, providerAccountId } },
            create: {
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              scope: account.scope,
            },
            update: {},
          });
          user.id = existingUser.id;
        }
        if (!user.emailVerified) {
          await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        }
      }
      return true;
    }
    ,
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.username = user.username;
        session.user.emailVerified = user.emailVerified;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    redirect() {
      return "/";
    },
  },
};
