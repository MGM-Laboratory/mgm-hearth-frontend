import NextAuth, { type NextAuthConfig } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER_URL ?? "https://iam.labmgm.org/realms/mgm";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID_HEARTH ?? "hearth-web";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET_HEARTH ?? "";
const IT_GROUP = process.env.KEYCLOAK_IT_GROUP ?? "/member/it-infrastructure";
const BOOTSTRAP_ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "admin@labmgm.org";

export type AppRole = "admin" | "maintainer" | "member";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    role: AppRole;
    groups: string[];
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      locale?: "en" | "id";
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    role?: AppRole;
    groups?: string[];
    error?: "RefreshAccessTokenError";
  }
}

function resolveRole(realmRoles: string[], groups: string[], email?: string | null): AppRole {
  if (realmRoles.includes("admin")) return "admin";
  if (email && email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) return "admin";
  if (groups.includes(IT_GROUP)) return "maintainer";
  return "member";
}

async function refreshAccessToken(token: {
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
}): Promise<{ accessToken?: string; refreshToken?: string; expiresAt?: number; error?: "RefreshAccessTokenError" }> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
  try {
    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });
    const res = await fetch(`${KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const tokens = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      error?: string;
    };
    if (!res.ok || tokens.error) {
      return { ...token, error: "RefreshAccessTokenError" };
    }
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.HEARTH_AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Keycloak({
      clientId: KEYCLOAK_CLIENT_ID,
      clientSecret: KEYCLOAK_CLIENT_SECRET,
      issuer: KEYCLOAK_ISSUER,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, trigger }) {
      // Initial login — capture access/refresh tokens and decode role.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;

        const realmRoles =
          (profile as { realm_access?: { roles?: string[] } } | undefined)?.realm_access?.roles ?? [];
        const groups = (profile as { groups?: string[] } | undefined)?.groups ?? [];
        token.role = resolveRole(realmRoles, groups, (profile as { email?: string })?.email);
        token.groups = groups;
        return token;
      }

      // Subsequent calls — refresh if within ~60s of expiry.
      if (token.expiresAt && Date.now() / 1000 < token.expiresAt - 60) {
        return token;
      }
      if (trigger === "update") return token;
      const refreshed = await refreshAccessToken(token);
      return { ...token, ...refreshed };
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.role = (token.role ?? "member") as AppRole;
      session.groups = token.groups ?? [];
      session.expiresAt = token.expiresAt;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
    error: "/api/auth/error",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
