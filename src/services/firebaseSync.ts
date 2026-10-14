import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  HospitalProfile,
  Doctor,
  Appointment,
  DiagnosticReport,
  NotificationItem,
  PatientReview,
  PatientUser,
  AdminUser,
  AuditLog,
} from "../types";
import {
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWS,
} from "../data/mockData";

// Real-time collection listener wrapper
export function subscribeToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void
): () => void {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as T);
      });
      callback(items);
    },
    (error) => {
      console.error(`Error subscribing to Firestore collection ${collectionName}:`, error);
    }
  );
}

// Write/Update helpers
export async function setFirestoreDoc(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error writing to ${collectionName}/${docId}:`, error);
  }
}

export async function updateFirestoreDoc(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating ${collectionName}/${docId}:`, error);
  }
}

export async function deleteFirestoreDoc(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting from ${collectionName}/${docId}:`, error);
  }
}

// Audit Logging helper
export async function addAuditLog(logData: {
  adminId: string;
  adminEmail: string;
  action: string;
  notes?: string;
}) {
  try {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      adminId: logData.adminId,
      adminEmail: logData.adminEmail,
      action: logData.action,
      timestamp: new Date().toISOString(),
      deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown Device",
      notes: logData.notes || "System maintenance operation",
    };
    await setDoc(doc(db, "audit_logs", newLog.id), newLog);
    return newLog;
  } catch (err) {
    console.error("Error creating audit log:", err);
  }
}

// Perform complete cloud database seed reset (Platform Admin only)
export async function executeAdminSeedResetInFirestore(
  admin: { id: string; email: string },
  notes?: string
) {
  try {
    console.log(`Executing cloud database seed reset by Admin ${admin.email}...`);

    const collectionsToReset = ["hospitals", "doctors", "appointments", "reports", "notifications", "reviews"];
    for (const colName of collectionsToReset) {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, colName, docSnap.id));
      }
    }

    // Re-seed Initial Data
    for (const hosp of INITIAL_HOSPITALS) {
      await setDoc(doc(db, "hospitals", hosp.id), hosp);
    }
    for (const docItem of INITIAL_DOCTORS) {
      await setDoc(doc(db, "doctors", docItem.id), docItem);
    }
    for (const apt of INITIAL_APPOINTMENTS) {
      await setDoc(doc(db, "appointments", apt.id), apt);
    }
    for (const rep of INITIAL_REPORTS) {
      await setDoc(doc(db, "reports", rep.id), rep);
    }
    for (const notif of INITIAL_NOTIFICATIONS) {
      await setDoc(doc(db, "notifications", notif.id), notif);
    }
    for (const rev of INITIAL_REVIEWS) {
      await setDoc(doc(db, "reviews", rev.id), rev);
    }

    // Record Audit Log
    await addAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "SYSTEM_SEED_RESET",
      notes: notes || "Full database seed reset executed by Platform Admin",
    });

    console.log("Cloud seed reset completed successfully!");
  } catch (err) {
    console.error("Error executing seed reset:", err);
    throw err;
  }
}

// Automatic initial cloud seeding function
export async function seedInitialFirestoreDataIfEmpty() {
  try {
    const hospRef = collection(db, "hospitals");
    const q = query(hospRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("Firestore database is empty. Seeding initial data across cloud...");

      // Seed Hospitals
      for (const hosp of INITIAL_HOSPITALS) {
        await setDoc(doc(db, "hospitals", hosp.id), hosp);
      }

      // Seed Doctors
      for (const docItem of INITIAL_DOCTORS) {
        await setDoc(doc(db, "doctors", docItem.id), docItem);
      }

      // Seed Appointments
      for (const apt of INITIAL_APPOINTMENTS) {
        await setDoc(doc(db, "appointments", apt.id), apt);
      }

      // Seed Reports
      for (const rep of INITIAL_REPORTS) {
        await setDoc(doc(db, "reports", rep.id), rep);
      }

      // Seed Notifications
      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, "notifications", notif.id), notif);
      }

      // Seed Reviews
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, "reviews", rev.id), rev);
      }

      console.log("Firestore cloud seeding completed successfully!");
    }
  } catch (err) {
    console.error("Error during cloud Firestore seed:", err);
  }
}
