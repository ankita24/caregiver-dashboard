import { db } from "../firebase.js"; // adjust path
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export const addParent = async ({
  caregiverUID,
  name,
  phone,
  relation,
  timezone = "Asia/Kolkata",
}: {
  caregiverUID: string;
  name: string;
  phone: string;
  relation: string;
  timezone?: string;
}) => {
  const personRef = doc(collection(db, "caregivers", caregiverUID, "people"));
  await setDoc(personRef, {
    name,
    phone,
    timezone,
    relation,
    createdAt: serverTimestamp(),
  });
};

export const getParents = async (caregiverUID: string) => {
  const snapshot = await getDocs(
    collection(db, "caregivers", caregiverUID, "people")
  );
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updatePerson = async (
  caregiverId: string,
  personId: string,
  data: {
    name?: string;
    phone?: string;
    relation?: string;
    timezone?: string;
  }
) => {
  const ref = doc(db, "caregivers", caregiverId, "people", personId);
  await updateDoc(ref, data);
};

export const updateMedication = async (
  caregiverId: string,
  personId: string,
  medicationId: string,
  data: {
    name?: string;
    dosage?: string;
    times?: string[];
    alertAfterMinutes?: number;
    notifyMethod?: string;
  }
) => {
  const ref = doc(
    db,
    "caregivers",
    caregiverId,
    "people",
    personId,
    "medications",
    medicationId
  );
  await updateDoc(ref, data);
};
