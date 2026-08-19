/// <reference types="vite/client" />

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

type FirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
};

const getFirebaseConfig = (): FirebaseConfig | null => {
  const configFromFile =
    firebaseAppletConfig && typeof firebaseAppletConfig === 'object' && Object.values(firebaseAppletConfig as Record<string, unknown>).some(Boolean)
      ? (firebaseAppletConfig as FirebaseConfig)
      : null;

  const configFromEnv: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY || undefined,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.FIREBASE_AUTH_DOMAIN || undefined,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID || undefined,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET || undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.FIREBASE_MESSAGING_SENDER_ID || undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.FIREBASE_APP_ID || undefined,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || import.meta.env.FIREBASE_MEASUREMENT_ID || undefined,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || import.meta.env.FIREBASE_DATABASE_ID || undefined,
  };

  if (configFromFile) {
    return { ...configFromEnv, ...configFromFile };
  }

  return Object.values(configFromEnv).some(Boolean) ? configFromEnv : null;
};

let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

try {
  const config = getFirebaseConfig();

  if (config && config.apiKey && config.projectId && config.appId) {
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    authInstance = getAuth(firebaseApp);
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
      dbInstance = getFirestore(firebaseApp, config.firestoreDatabaseId);
    } else {
      dbInstance = getFirestore(firebaseApp);
    }
    console.log(`[CONEXA FIREBASE] Firebase inicializado correctamente para el proyecto: ${config.projectId}`);
  } else {
    console.warn('[CONEXA FIREBASE] No se encontró una configuración válida de Firebase. DEMO MODE — Firebase Authentication no configurado.');
  }
} catch (e) {
  console.warn('[CONEXA FIREBASE] Error al inicializar Firebase:', e);
}

export const app = firebaseApp;
export const auth = authInstance;
export const db = dbInstance;
export const isFirebaseConfigured = Boolean(authInstance && dbInstance);

/**
 * Recursively cleans an object or array to remove any properties whose value is `undefined`.
 * Firebase Firestore SDK throws an error if any property value is `undefined`.
 */
export function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item)) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      cleaned[key] = cleanFirestoreData(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}
