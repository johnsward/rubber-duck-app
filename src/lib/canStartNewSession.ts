// src/utils/canStartNewSession.ts
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export async function canStartNewSession(): Promise<boolean> {
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2024-11"
  const sessionDocRef = doc(db, "monthlySessions", currentMonth);
  const sessionDoc = await getDoc(sessionDocRef);

  if (sessionDoc.exists()) {
    const sessionData = sessionDoc.data();
    if (sessionData.sessionCount >= 50) {
      return false; // Limit reached for this month
    }

    // Increment session count
    await updateDoc(sessionDocRef, {
      sessionCount: sessionData.sessionCount + 1
    });
  } else {
    // If this month’s document doesn’t exist, create it with a count of 1
    await setDoc(sessionDocRef, {
      month: currentMonth,
      sessionCount: 1
    });
  }

  return true;
}