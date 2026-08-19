/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Check if firebase-applet-config.json exists or environment config is provided
let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

try {
  // Dynamically import or check config if available
  // Standard AI Studio Firebase config file name is firebase-applet-config.json
  const modules = import.meta.glob('/firebase-applet-config.json', { eager: true });
  const configKey = Object.keys(modules)[0];
  
  if (configKey && (modules[configKey] as any)?.default) {
    const config = (modules[configKey] as any).default;
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    authInstance = getAuth(firebaseApp);
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
      dbInstance = getFirestore(firebaseApp, config.firestoreDatabaseId);
    } else {
      dbInstance = getFirestore(firebaseApp);
    }
    console.log('[CONEXA FIREBASE] Firebase inicializado con configuración oficial.');
  } else {
    console.warn('[CONEXA FIREBASE] firebase-applet-config.json no detectado. DEMO MODE — Firebase Authentication no configurado.');
  }
} catch (e) {
  console.warn('[CONEXA FIREBASE] Error al inicializar Firebase:', e);
}

export const app = firebaseApp;
export const auth = authInstance;
export const db = dbInstance;
export const isFirebaseConfigured = Boolean(authInstance && dbInstance);
