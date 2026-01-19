import { collection, doc, setDoc, getDocs, query, where, getDoc, addDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'

export interface RegistrationRecord {
  childName: string;
  parentName: string;
  email: string;
  age: string;
  parentalConsent?: boolean;
  registeredAt: string;
  assessment?: any;
  assessmentCompletedAt?: string;
  // ℹ️ Password is NOT stored - managed by Firebase Authentication only
}

export async function createRegistration(record: RegistrationRecord) {
  try {
    // If record has an owner UID (created via Auth), use that as the doc id.
    // Support both `ownerUid` (legacy) and `uid` fields.
    const ownerUid = (record as any).ownerUid || (record as any).uid;
    if (ownerUid) {
      const docRef = doc(db, 'users', ownerUid);
      await setDoc(docRef, record, { merge: true });
      return true;
    }

    // Otherwise create a new document in users
    const colRef = collection(db, 'users')
    await addDoc(colRef, record)
    return true
  } catch (err) {
    console.error('createRegistration error', err)
    throw err
  }
}

export async function getRegistrationByNumericId(numericId: number) {
  try {
    const colRef = collection(db, 'users')
    const q = query(colRef, where('id', '==', numericId))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docSnap = snap.docs[0]
    return { ...docSnap.data(), _docId: docSnap.id }
  } catch (err) {
    console.error('getRegistrationByNumericId error', err)
    throw err
  }
}

export async function getUserByUid(uid: string) {
  try {
    const docRef = doc(db, 'users', uid)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return null
    return { ...snap.data(), _docId: snap.id } as RegistrationRecord & { _docId: string }
  } catch (err) {
    console.error('getUserByUid error', err)
    throw err
  }
}

export async function updateUserByNumericId(numericId: number, data: Record<string, any>) {
  try {
    const colRef = collection(db, 'users')
    const q = query(colRef, where('localId', '==', numericId))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docSnap = snap.docs[0]
    const docRef = doc(db, 'users', docSnap.id)
    await updateDoc(docRef, data)
    return true
  } catch (err) {
    console.error('updateUserByNumericId error', err)
    throw err
  }
}

export async function updateUserByUid(uid: string, data: Record<string, any>) {
  try {
    const docRef = doc(db, 'users', uid)
    await updateDoc(docRef, data)
    return true
  } catch (err) {
    console.error('updateUserByUid error', err)
    throw err
  }
}

// Simple helpers for saving and loading arbitrary figma page content
export async function saveFigmaPage(name: string, data: Record<string, any>) {
  try {
    const docRef = doc(db, 'figmaPages', name)
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() })
    return true
  } catch (err) {
    console.error('saveFigmaPage error', err)
    throw err
  }
}

export async function loadFigmaPage(name: string) {
  try {
    const docRef = doc(db, 'figmaPages', name)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return null
    return snap.data()
  } catch (err) {
    console.error('loadFigmaPage error', err)
    throw err
  }
}
