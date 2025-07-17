import * as admin from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as path from "path";

if (getApps().length === 0) {
  const serviceAccountPath = path.join(process.cwd(), "serviceAccount.json");

  initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const firestore = getFirestore();
export const storage = getStorage();
