import { arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { db, storage, artworkStoragePath } from "@/lib/firebase";

// Uploads a file to the booking owner's artwork folder and appends its path
// to the booking's artworkPaths — used both by the customer dashboard
// (adding artwork after the fact) and the admin "Manage" dialog (attaching
// artwork on a customer's behalf, e.g. one that arrived by email after a
// phoned-in booking).
export async function addBookingArtwork(
  bookingId: string,
  ownerUid: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const path = artworkStoragePath(ownerUid, bookingId, `${Date.now()}-${file.name}`);
  const storageRef = ref(storage, path);
  await new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => resolve(),
    );
  });
  await getDownloadURL(storageRef); // surfaces any post-upload access errors early
  await updateDoc(doc(db, "bookings", bookingId), {
    artworkPaths: arrayUnion(path),
    updatedAt: serverTimestamp(),
  });
}
