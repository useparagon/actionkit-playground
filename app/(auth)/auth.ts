import { withAuth } from "@workos-inc/authkit-nextjs";
import { compare } from "bcrypt-ts";
import NextAuth, { User, Session } from "next-auth";
import { SignJWT } from "jose";
import Credentials from "next-auth/providers/credentials";

import { getUser, STATIC_USER } from "@/db/queries";

import { authConfig } from "./auth.config";

export interface ExtendedSession extends Session {
  user: User;
  paragonUserToken?: string;
}

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        let users = await getUser(email);
        if (users.length === 0) return null;
        let passwordsMatch = await compare(password, users[0].password!);
        if (passwordsMatch) return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      const PRIVATE_KEY = await importPrivateKey(
        process.env.PARAGON_SIGNING_KEY!
      );
      if (session.user) {
        session.user.id = token.id as string;
        try {
          const paragonUserToken = await new SignJWT({
            sub: session.user.id,
          })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setExpirationTime("60m")
            .sign(PRIVATE_KEY);
          session.paragonUserToken = paragonUserToken;
        } catch (err) {
          console.error("Paragon signing error", err);
        }
      }

      return session;
    },
  },
});

export async function userWithToken() {
  let user;
  if (process.env.ENABLE_AUTH !== "false") {
    user = (
      await withAuth({
        ensureSignedIn: true,
      })
    ).user;
  } else {
    user = STATIC_USER;
  }

  const PRIVATE_KEY = await importPrivateKey(process.env.PARAGON_SIGNING_KEY!);

  if (user) {
    try {
      const paragonUserToken = await new SignJWT({
        sub: user.id,
      })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(PRIVATE_KEY);

      return {
        user,
        paragonUserToken,
      };
    } catch (err) {
      console.error("Paragon signing error", err);
    }
  }
  return { user: null };
}

export const auth = userWithToken;

/*
  Import a PEM encoded RSA private key, to use for RSA-PSS signing.
  Takes a string containing the PEM encoded key, and returns a Promise
  that will resolve to a CryptoKey representing the private key.
  */
async function importPrivateKey(pem: string) {
  // Replace encoded newlines with actual newlines
  pem = pem.replace(/\\n/g, "\n");

  // Normalize newlines to '\n'
  pem = pem.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove unnecessary whitespace and ensure proper PEM format
  pem = pem.trim();

  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";

  if (!pem.startsWith(pemHeader) || !pem.endsWith(pemFooter)) {
    throw new Error("PEM format is incorrect.");
  }

  // Fetch the part of the PEM string between header and footer
  let pemContents = pem
    .substring(pemHeader.length, pem.length - pemFooter.length)
    .replace(/[\s\n]+/g, ""); // Remove all whitespace and newline characters

  // Base64 decode the string to get the binary data
  const binaryDerString = Buffer.from(pemContents, "base64");

  try {
    return await globalThis.crypto.subtle.importKey(
      "pkcs8",
      binaryDerString,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      true,
      ["sign"]
    );
  } catch (err) {
    console.warn(
      "Could not import signing key, it may be in an invalid format."
    );
    throw err;
  }
}
