import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { auth } from './firebase';

export const saveArguments = async (topic, content, debateType) => {
  try {
    await addDoc(collection(db, 'arguments'), {
      userId: auth.currentUser.uid,
      topic,
      content,
      debateType,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Firestore Save Error:', error);
  }
};

export const fetchSavedArguments = async () => {
  try {
    const q = query(collection(db, 'arguments'), where('userId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Firestore Fetch Error:', error);
    return [];
  }
};

export async function deleteSavedArgument(id) {
  const ref = doc(db, 'arguments', id);
  if (ref) {
    await deleteDoc(ref);
  } else {
    console.warn('Document does not exist:', id);
  }
}
