import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// This app renders `AuthProvider` (which imports this module) as part of the
// root route tree, which TanStack Start also renders during SSR. The
// Firebase JS SDK expects a browser environment, so every export here is
// left `undefined` on the server and only real once running client-side —
// consumers of `auth`/`db`/`storage` must only ever touch them from
// useEffect/event handlers (never during render), same as this module must
// never be imported from a route `loader` or `head` function.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;

if (typeof window !== "undefined") {
  app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  storageInstance = getStorage(app);
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;
export const storage = storageInstance as FirebaseStorage;

// Storage path convention for uploaded campaign artwork. Must stay in sync
// with the `artwork/{userId}/{allPaths=**}` match in storage.rules.
export function artworkStoragePath(uid: string, bookingId: string, filename: string): string {
  return `artwork/${uid}/${bookingId}/${filename}`;
}
