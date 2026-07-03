import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// `AuthProvider` (which imports this module) renders as part of the root
// route tree, which TanStack Start also renders during SSR. `auth`/`storage`
// are left `undefined` on the server and only real once running
// client-side — this app's usage of them (auth-state listeners, popups,
// resumable uploads) is inherently browser-only, so consumers must only ever
// touch them from useEffect/event handlers, never during render.
//
// `db` (Firestore) is different: `getFirestore()` doesn't touch any browser
// API at construction — it only opens a network/IndexedDB connection lazily
// when a query actually runs, and this app doesn't enable IndexedDB
// persistence. So `db` is initialized unconditionally and is safe to use in
// server loaders/route handlers (plain `getDoc`/`getDocs` reads) as well as
// client code.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);

let authInstance: Auth | undefined;
let storageInstance: FirebaseStorage | undefined;
let analyticsInstance: Analytics | undefined;

if (typeof window !== "undefined") {
  authInstance = getAuth(app);
  storageInstance = getStorage(app);

  // Only send real hits from production builds, so local `npm run dev`
  // sessions don't pollute the live GA4 property with test traffic.
  if (import.meta.env.PROD) {
    try {
      analyticsInstance = getAnalytics(app);
    } catch {
      // Unsupported environment (rare) — analytics is non-critical, fail silently.
    }
  }
}

export const auth = authInstance as Auth;
export const storage = storageInstance as FirebaseStorage;
// Unlike auth/storage, analytics can legitimately fail to initialize even in
// a real browser (see try/catch above), so this stays possibly-undefined
// rather than cast away — callers (src/lib/analytics.ts) check truthiness.
export const analytics = analyticsInstance;

// Storage path convention for uploaded campaign artwork. Must stay in sync
// with the `artwork/{userId}/{allPaths=**}` match in storage.rules.
export function artworkStoragePath(uid: string, bookingId: string, filename: string): string {
  return `artwork/${uid}/${bookingId}/${filename}`;
}

// Storage path convention for billboard images/gallery. Must stay in sync
// with the `billboards/{billboardId}/{allPaths=**}` match in storage.rules.
export function billboardStoragePath(billboardId: string, filename: string): string {
  return `billboards/${billboardId}/${filename}`;
}
