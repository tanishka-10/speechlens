// src/services/config.js
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const getAPIKeys = async () => {
  try {
    const ref = doc(db, 'Config', 'api_keys');
    
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : {};
  } catch (err) {
    console.error("Error fetching API keys", err);
    return {};
  }
};
