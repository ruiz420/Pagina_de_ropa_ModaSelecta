import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const demoUser = {
  id: "demo-admin",
  name: "Administrador Demo",
  email: "demo@local.dev",
  image: null,
  role: "ADMIN",
};

function isDemoLogin(email: string, password: string) {
  return email === "demo@local.dev" && password === "demo1234";
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "development-secret",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 2,
    updateAge: 0,
  },
  jwt: {
    maxAge: 60 * 60 * 2,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const allowDemoLogin = !process.env.DATABASE_URL;

        if (allowDemoLogin && isDemoLogin(credentials.email, credentials.password)) {
          return demoUser;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { role: true },
          });

          if (!user?.passwordHash) {
            return allowDemoLogin && isDemoLogin(credentials.email, credentials.password)
              ? demoUser
              : null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            return allowDemoLogin && isDemoLogin(credentials.email, credentials.password)
              ? demoUser
              : null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role.name,
          };
        } catch {
          return allowDemoLogin && isDemoLogin(credentials.email, credentials.password)
            ? demoUser
            : null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
