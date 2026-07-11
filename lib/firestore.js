// Server-only Firestore via the Firebase Admin SDK. Credentials come from
// env vars (see .env.local.example) — the Admin SDK bypasses security rules,
// so nothing about the database needs to be publicly writable.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function isFirestoreConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

// Returns a Firestore instance, or null when credentials aren't set up yet
// (the updates route falls back to local JSON storage in that case).
export function getDb() {
  if (!isFirestoreConfigured()) return null;
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // .env files store the key single-line with literal \n sequences
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}
