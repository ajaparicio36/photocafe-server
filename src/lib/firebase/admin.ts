import * as admin from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    (process.env.FIREBASE_SERVICE_ACCOUNT || "{}").replace(/'/g, '"')
  );

  initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const firestore = getFirestore();
export const storage = getStorage();
