import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";

import { getFirebaseAuth } from "./client";

const EMAIL_FOR_SIGN_IN_KEY = "demee:emailForSignIn";

export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(getFirebaseAuth(), provider);
}

/**
 * Trigger a magic-link email through our own backend instead of
 * Firebase's stock email sender. The server route generates the
 * actual sign-in link via the Admin SDK and ships it through Resend
 * with our branded template. The link is still a regular Firebase
 * magic link, so `signInWithEmailLink` on the client consumes it
 * exactly the same way it would have.
 */
export async function sendMagicLink(email: string): Promise<void> {
  const origin = window.location.origin;
  const continueUrl = `${origin}/callback`;
  const res = await fetch("/api/auth/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, continueUrl }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(`magic-link failed: ${body.error ?? res.statusText}`);
  }
  // Stash the email so completeMagicLinkSignIn can recover it once
  // the visitor returns from clicking the link in their inbox.
  window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
}

export function isMagicLinkUrl(url: string): boolean {
  return isSignInWithEmailLink(getFirebaseAuth(), url);
}

export function getStoredEmailForSignIn(): string | null {
  return window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
}

export async function completeMagicLinkSignIn(
  email: string,
  url: string,
): Promise<UserCredential> {
  const credential = await signInWithEmailLink(getFirebaseAuth(), email, url);
  window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
  return credential;
}

export async function mintServerSession(idToken: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown" }));
    throw new Error(`session mint failed: ${body.error ?? res.statusText}`);
  }
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
  await fetch("/api/auth/session", { method: "DELETE" });
}
