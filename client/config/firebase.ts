import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
  apiKey: "AIzaSyBShAXGl3QOUGg-RcM3NXsmfxly6mhGUO8",
  authDomain: "snitch-2.firebaseapp.com",
  projectId: "snitch-2",
  storageBucket: "snitch-2.firebasestorage.app",
  messagingSenderId: "474118589191",
  appId: "1:474118589191:web:734c1c3949e961167093a2"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();
export { auth };
export const db = getFirestore(app);
export default app;
