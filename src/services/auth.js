// src/services/auth.js
import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from './firebase';

let auth;

export const getFirebaseAuth = () => {
  if (!auth) {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (e) {
      console.error(e);
      auth = getAuth(app); // fallback if already initialized
    }
  }
  return auth;
};
