import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations";
import { logAudit, getClientIp } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role!;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  // KVKK: erişim (giriş/çıkış) kayıtları. Hata olursa oturum akışı bozulmaz.
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      const ip = await getClientIp();
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch {
        // son giriş damgası yazılamazsa girişi engelleme
      }
      await logAudit({
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
        metadata: ip ? { ip } : undefined,
      });
    },
    async signOut(message) {
      // jwt stratejisinde olay `{ token }` ile gelir.
      const userId =
        "token" in message && message.token
          ? ((message.token as { id?: string }).id ?? null)
          : null;
      if (!userId) return;
      const ip = await getClientIp();
      await logAudit({
        userId,
        action: "LOGOUT",
        entity: "User",
        entityId: userId,
        metadata: ip ? { ip } : undefined,
      });
    },
  },
});
