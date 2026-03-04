import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { OAuthConfig } from "next-auth/providers";

interface LINEProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

const LINE: OAuthConfig<LINEProfile> = {
  id: "line",
  name: "LINE",
  type: "oauth",
  authorization: {
    url: "https://access.line.me/oauth2/v2.1/authorize",
    params: { scope: "profile" },
  },
  token: "https://api.line.me/oauth2/v2.1/token",
  userinfo: "https://api.line.me/v2/profile",
  clientId: process.env.AUTH_LINE_ID,
  clientSecret: process.env.AUTH_LINE_SECRET,
  checks: ["state"],
  profile(profile) {
    return {
      id: profile.userId,
      name: profile.displayName,
      email: null,
      image: profile.pictureUrl ?? null,
    };
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    LINE,
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
