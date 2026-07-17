import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-only Firebase Admin instance.
 *
 * Requires these environment variables (set in Vercel project settings,
 * never committed to the repo):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (paste with literal \n line breaks; we unescape below)
 *
 * These come from a Firebase service account JSON (Project Settings ->
 * Service accounts -> Generate new private key). This is intentionally
 * separate from the public firebaseConfig used on the client, because it
 * grants full read/write access and must never reach the browser.
 */
function buildAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const adminApp = buildAdminApp();
const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth };
