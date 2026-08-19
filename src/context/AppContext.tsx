import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, cleanFirestoreData } from '../lib/firebase';
import { captureAndStoreUtms, getStoredUtms } from '../utils/attribution';
import { 
  UserProfile, Category, Profession, ServiceRequest, Quote, 
  Conversation, Message, Review, UserReport, VerificationRequest, 
  NotificationItem, LocationData, InviteCode, FeedbackItem, AnalyticsEvent, BetaConfig,
  RadarOpportunity, RadarStats, ApprovalMode, Role, Transaction
} from '../types';
import { 
  INITIAL_CATEGORIES, INITIAL_PROFESSIONS, INITIAL_PROFILES, 
  INITIAL_REVIEWS, INITIAL_SERVICE_REQUESTS, INITIAL_QUOTES, 
  INITIAL_CONVERSATIONS, INITIAL_MESSAGES 
} from '../data/mockData';
import { initialRadarOpportunities, initialRadarStats } from '../data/radarMockData';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  switchUserRole: (userId: string) => void;
  switchActiveMode: (mode: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN') => boolean;
  authLoading: boolean;
  authSessionReady: boolean;
  isAuthPortalOpen: boolean;
  openAuthPortal: () => void;
  closeAuthPortal: () => void;
  
  isAdmin: () => boolean;
  hasRole: (roles: Role[]) => boolean;
  
  users: UserProfile[];
  categories: Category[];
  professions: Profession[];
  reviews: Review[];
  requests: ServiceRequest[];
  quotes: Quote[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  reports: UserReport[];
  verifications: VerificationRequest[];
  notifications: NotificationItem[];
  transactions: Transaction[];
  favorites: string[]; // professional IDs
  
  // Beta 1.0 States
  betaConfig: BetaConfig;
  inviteCodes: InviteCode[];
  feedbacks: FeedbackItem[];
  analyticsEvents: AnalyticsEvent[];

  // CONEXA RADAR States
  radarOpportunities: RadarOpportunity[];
  radarStats: RadarStats;
  approvalMode: ApprovalMode;
  setApprovalMode: (mode: ApprovalMode) => void;
  addRadarOpportunity: (opp: RadarOpportunity) => void;
  updateRadarOpportunity: (id: string, updates: Partial<RadarOpportunity>) => void;
  deleteRadarOpportunity: (id: string) => void;
  convertRadarOpportunity: (opportunityId: string, userId?: string) => void;
  
  // Search & Filter State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedProfession: string | null;
  setSelectedProfession: (prof: string | null) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  maxDistanceKm: number;
  setMaxDistanceKm: (dist: number) => void;
  onlyVerified: boolean;
  setOnlyVerified: (v: boolean) => void;
  
  // Actions
  toggleFavorite: (proId: string) => void;
  sharePhoneWithUser: (conversationId: string, recipientId: string) => void;
  shareAddressWithUser: (conversationId: string, recipientId: string) => void;
  sendMessage: (conversationId: string, content: string, type?: Message['type'], quoteData?: Quote) => void;
  createConversation: (targetUserId: string) => string;
  createServiceRequest: (req: Omit<ServiceRequest, 'id' | 'clientId' | 'clientName' | 'clientAvatar' | 'createdAt' | 'status' | 'quotesCount'>) => void;
  submitQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'status'>) => void;
  acceptQuote: (quoteId: string) => Promise<Transaction | null>;
  connectMercadoPago: () => Promise<void>;
  createMercadoPagoCheckout: (transactionId: string) => Promise<string>;
  getMercadoPagoStatus: () => Promise<{ connected: boolean; mpUserId?: string | null; publicKey?: string | null }>;
  completeJob: (jobId: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'isVerifiedJob'>) => void;
  submitVerification: (type: 'IDENTITY' | 'PROFESSIONAL', documentName: string, docUrl: string) => void;
  approveVerification: (verificationId: string) => void;
  reportUser: (reportedUserId: string, reason: UserReport['reason'], description: string) => void;
  blockUser: (userIdToBlock: string) => void;
  resolveReport: (reportId: string, action: 'DISMISSED' | 'ACTION_TAKEN') => void;
  markNotificationRead: (notifId: string) => void;
  deleteAccount: (userId: string) => Promise<boolean>;
  
  // Beta Actions
  trackEvent: (eventName: string, context?: Record<string, any>) => void;
  submitFeedback: (category: FeedbackItem['category'], comment: string) => void;
  createInviteCode: (code: string, maxUses: number, role: UserProfile['role'], note?: string) => void;
  toggleInviteCode: (codeId: string) => void;
  updateBetaConfig: (updates: Partial<BetaConfig>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (isFirebaseConfigured) {
      return []; // empty until Firestore snapshot loads them
    }
    const saved = localStorage.getItem('conexa_users');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (isFirebaseConfigured) {
      return null;
    }
    return users[0] || null;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authSessionReady, setAuthSessionReady] = useState<boolean>(!isFirebaseConfigured);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [professions] = useState<Profession[]>(INITIAL_PROFESSIONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_SERVICE_REQUESTS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [favorites, setFavorites] = useState<string[]>(['pro-1']);
  const [isAuthPortalOpen, setIsAuthPortalOpen] = useState<boolean>(false);
  const openAuthPortal = () => setIsAuthPortalOpen(true);
  const closeAuthPortal = () => setIsAuthPortalOpen(false);
  
  const [reports, setReports] = useState<UserReport[]>([
    {
      id: 'rep-1',
      reporterId: 'user-particular-1',
      reporterName: 'Gonzalo Morales',
      reportedUserId: 'pro-5',
      reportedUserName: 'Jorge "Coqui" Benítez',
      reason: 'SPAM',
      description: 'Envía mensajes automáticos ofreciendo presupuesto no solicitado.',
      createdAt: 'Ayer',
      status: 'PENDING'
    }
  ]);

  const [verifications, setVerifications] = useState<VerificationRequest[]>([
    {
      id: 'ver-1',
      userId: 'pro-2',
      userName: 'Marcelo "Chelo" Juárez',
      userRole: 'PROFESSIONAL',
      type: 'PROFESSIONAL',
      documentName: 'Registro_Municipal_Plomeria_SdE.pdf',
      documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
      status: 'PENDING',
      createdAt: 'Hace 1 día'
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'user-particular-1',
      title: 'Nuevo presupuesto recibido',
      body: 'El Ing. Carlos Mansilla envió un presupuesto para tu solicitud de aire acondicionado.',
      type: 'QUOTE',
      read: false,
      createdAt: 'Hace 1 hora',
      targetId: 'req-1'
    }
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Santiago del Estero');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(30);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Sync users to localStorage (for local preferences only - NOT for authorization)
  // Capture UTM parameters on initial load
  useEffect(() => {
    captureAndStoreUtms();
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured) return;
    localStorage.setItem('conexa_users', JSON.stringify(users));
  }, [users]);

  // Firebase Auth Real Listener Effect & Real-time Firestore Sync
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthSessionReady(false);
      try {
        if (firebaseUser) {
          console.log('[CONEXA AUTH] Usuario autenticado vía Firebase Auth:', firebaseUser.uid, firebaseUser.email);
          
          const tokenResult = await firebaseUser.getIdTokenResult();
          const claimRole = (tokenResult.claims.role as Role) || 'USER';
          
          if (isFirebaseConfigured && db) {
            // Load or create `/users/{uid}` in Firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            let profileData: Partial<UserProfile> = {};
            if (userDocSnap.exists()) {
              profileData = userDocSnap.data() as Partial<UserProfile>;
              console.log('[CONEXA AUTH] Perfil de usuario cargado de Firestore:', profileData);
            } else {
              // Create default profile for newly registered users
              const defaultProfile: UserProfile = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuario CONEXA',
                email: firebaseUser.email || '',
                phonePrivate: '',
                avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                role: claimRole,
                activeMode: claimRole === 'PROFESSIONAL' ? 'PROFESSIONAL' : claimRole === 'ADMIN' ? 'ADMIN' : 'CLIENT',
                isProfessional: claimRole === 'PROFESSIONAL',
                hasProfessionalProfile: claimRole === 'PROFESSIONAL',
                joinedDate: new Date().toLocaleDateString('es-AR'),
                location: {
                  city: 'Santiago del Estero',
                  province: 'Santiago del Estero',
                  country: 'Argentina',
                  lat: -27.7834,
                  lng: -64.2642,
                  approxZone: 'Santiago del Estero - Centro'
                },
                isIdentityVerified: firebaseUser.emailVerified || false,
                identityVerificationStatus: 'NONE',
                rating: claimRole === 'PROFESSIONAL' ? 5.0 : 0,
                reviewCount: 0,
                jobsCompleted: 0,
                trustScore: 50,
                availabilityStatus: 'DISPONIBLE'
              };
              await setDoc(userDocRef, cleanFirestoreData(defaultProfile));
              profileData = defaultProfile;
              console.log('[CONEXA AUTH] Perfil por defecto guardado en Firestore.');
            }
            
            // Core Auth Synch Rules: Firestore is the Source of Truth for Role & Profile (except ADMIN/SUPER_ADMIN checks)
            const firestoreRole = profileData.role;
            const isClaimAdmin = claimRole === 'ADMIN' || claimRole === 'SUPER_ADMIN';
            
            let effectiveRole: Role = 'USER';
            if (firestoreRole === 'ADMIN' || firestoreRole === 'SUPER_ADMIN') {
              if (isClaimAdmin) {
                effectiveRole = firestoreRole;
              } else {
                console.warn(`[CONEXA SECURITY] Se detectó intento de elevación de privilegios en Firestore para UID: ${firebaseUser.uid} sin Custom Claim de Admin correspondiente.`);
                effectiveRole = 'USER';
              }
            } else if (firestoreRole) {
              effectiveRole = firestoreRole;
            } else {
              effectiveRole = claimRole;
            }

            const finalIsProfessional = profileData.isProfessional === true || 
                                        profileData.hasProfessionalProfile === true || 
                                        effectiveRole === 'PROFESSIONAL' || 
                                        profileData.activeMode === 'PROFESSIONAL';
            
            const finalHasProfessionalProfile = profileData.hasProfessionalProfile === true || 
                                                profileData.isProfessional === true || 
                                                effectiveRole === 'PROFESSIONAL' || 
                                                profileData.activeMode === 'PROFESSIONAL';

            const finalActiveMode = profileData.activeMode || 
                                    (effectiveRole === 'ADMIN' || effectiveRole === 'SUPER_ADMIN' ? 'ADMIN' : (finalIsProfessional ? 'PROFESSIONAL' : 'CLIENT'));

            console.log('[CONEXA DIAGNOSTICS]', {
              uid: firebaseUser.uid,
              firestoreRole: firestoreRole || null,
              claimRole,
              effectiveRole,
              isProfessional: finalIsProfessional,
              hasProfessionalProfile: finalHasProfessionalProfile,
              activeMode: finalActiveMode
            });

            setCurrentUser({
              ...profileData,
              id: firebaseUser.uid,
              name: profileData.name || firebaseUser.displayName || 'Usuario CONEXA',
              email: profileData.email || firebaseUser.email || '',
              avatar: profileData.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
              role: effectiveRole,
              activeMode: finalActiveMode,
              isProfessional: finalIsProfessional,
              hasProfessionalProfile: finalHasProfessionalProfile,
              isIdentityVerified: firebaseUser.emailVerified || profileData.isIdentityVerified || false
            } as UserProfile);
            setAuthSessionReady(true);
          } else {
            // Firebase Auth configured partially or in local mode
            setCurrentUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuario Piloto',
              email: firebaseUser.email || '',
              phonePrivate: '385-555-0192',
              avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
              role: claimRole,
              joinedDate: new Date().toLocaleDateString('es-AR'),
              location: {
                city: 'Santiago del Estero',
                province: 'Santiago del Estero',
                country: 'Argentina',
                lat: -27.7834,
                lng: -64.2642,
                approxZone: 'Centro'
              },
              isIdentityVerified: true,
              rating: 5,
              reviewCount: 1,
              jobsCompleted: 3,
              trustScore: 90,
              availabilityStatus: 'DISPONIBLE'
            } as UserProfile);
            setAuthSessionReady(true);
          }
        } else {
          console.log('[CONEXA AUTH] Sin sesión activa.');
          if (isFirebaseConfigured) {
            setCurrentUser(null);
          } else {
            // Keep mock user 0 in demo mode
            setCurrentUser(INITIAL_PROFILES[0]);
          }
          setAuthSessionReady(false);
        }
      } catch (err) {
        console.warn('[CONEXA AUTH] Error procesando autenticación:', err);
        setAuthSessionReady(false);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization with Firestore in production mode
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !auth) return;

    console.log("[CONEXA SYNCHRONIZER] Sincronización activa con Firestore...");

    // Helper to seed a collection with mock data if empty
    const seedCollectionIfEmpty = async (collectionName: string, initialData: any[]) => {
      // ABSOLUTE SECURITY RULE: Never seed simulation data on real production/cloud environment
      const isProdOrCloud = import.meta.env.PROD || import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';
      if (isProdOrCloud) {
        console.log(`[CONEXA SEED] Evitando siembra de datos de simulación en producción para: ${collectionName}`);
        return;
      }
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        if (querySnapshot.empty) {
          console.log(`[CONEXA SEED] Sembrando datos para ${collectionName}...`);
          for (const item of initialData) {
            await setDoc(doc(db, collectionName, item.id || `doc-${Math.random()}`), cleanFirestoreData(item));
          }
        }
      } catch (err) {
        console.warn(`[CONEXA SEED] Error en ${collectionName}:`, err);
      }
    };

    // Seed collections asynchronously
    const seedAll = async () => {
      await seedCollectionIfEmpty('users', INITIAL_PROFILES);
      await seedCollectionIfEmpty('reviews', INITIAL_REVIEWS);
      await seedCollectionIfEmpty('service_requests', INITIAL_SERVICE_REQUESTS);
      await seedCollectionIfEmpty('quotes', INITIAL_QUOTES);
      await seedCollectionIfEmpty('conversations', INITIAL_CONVERSATIONS);
    };
    seedAll();

    // Set up real-time sub subscriptions
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList: UserProfile[] = [];
      snapshot.forEach(doc => {
        uList.push(doc.data() as UserProfile);
      });
      if (uList.length > 0) {
        setUsers(uList);
      }
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const list: Review[] = [];
      snapshot.forEach(doc => list.push(doc.data() as Review));
      setReviews(list);
    });

    const unsubRequests = onSnapshot(collection(db, 'service_requests'), (snapshot) => {
      const list: ServiceRequest[] = [];
      snapshot.forEach(doc => list.push(doc.data() as ServiceRequest));
      setRequests(list);
    });

    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      const list: Quote[] = [];
      snapshot.forEach(doc => list.push(doc.data() as Quote));
      setQuotes(list);
    });

    const unsubConversations = onSnapshot(collection(db, 'conversations'), (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach(doc => list.push(doc.data() as Conversation));
      setConversations(list);
    });

    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const list: UserReport[] = [];
      snapshot.forEach(doc => list.push(doc.data() as UserReport));
      setReports(list);
    });

    const unsubVerifications = onSnapshot(collection(db, 'verifications'), (snapshot) => {
      const list: VerificationRequest[] = [];
      snapshot.forEach(doc => list.push(doc.data() as VerificationRequest));
      setVerifications(list);
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach(doc => list.push(doc.data() as Transaction));
      setTransactions(list);
    });

    return () => {
      unsubUsers();
      unsubReviews();
      unsubRequests();
      unsubQuotes();
      unsubConversations();
      unsubReports();
      unsubVerifications();
      unsubTransactions();
    };
  }, []);

  const deleteAccount = async (userId: string): Promise<boolean> => {
    try {
      const token = auth ? await auth.currentUser?.getIdToken() : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        console.log('[CONEXA AUTH] Cuenta eliminada con éxito del backend.');
        if (auth) {
          await auth.signOut();
        }
        setCurrentUser(null);
        return true;
      } else {
        console.warn('[CONEXA AUTH] Error al dar de baja la cuenta:', resData.error || response.statusText);
        alert(`Error al eliminar cuenta: ${resData.error || 'Intente nuevamente.'}`);
        return false;
      }
    } catch (err: any) {
      console.error('[CONEXA AUTH] Excepción al invocar baja de cuenta:', err);
      alert('Error de conexión al servidor al solicitar baja de cuenta.');
      return false;
    }
  };

  // Helper authorization checks based on real currentUser.role
  const isAdmin = (): boolean => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  };

  const hasRole = (roles: Role[]): boolean => {
    return !!currentUser?.role && roles.includes(currentUser.role);
  };

  const switchUserRole = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      // If switching to a non-admin user while activeMode was ADMIN, reset activeMode to CLIENT/PROFESSIONAL
      const isFoundAdmin = found.role === 'ADMIN' || found.role === 'SUPER_ADMIN';
      const adjustedMode = (!isFoundAdmin && currentUser.activeMode === 'ADMIN')
        ? (found.isProfessional ? 'PROFESSIONAL' : 'CLIENT')
        : found.activeMode || (found.isProfessional ? 'PROFESSIONAL' : 'CLIENT');
      
      const updatedUser = { ...found, activeMode: adjustedMode };
      setCurrentUser(updatedUser);
    }
  };

  const switchActiveMode = (mode: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'): boolean => {
    // SECURITY RULE: ADMIN mode is strictly restricted to ADMIN or SUPER_ADMIN role
    if (mode === 'ADMIN') {
      if (!isAdmin()) {
        console.warn(`[CONEXA SECURITY] Intento no autorizado de activar MODO ADMIN por usuario id=${currentUser?.id} con rol=${currentUser?.role}`);
        return false;
      }
    }

    if (currentUser) {
      const updated = {
        ...currentUser,
        activeMode: mode
      };
      setCurrentUser(updated);
      setUsers(uList => uList.map(u => u.id === currentUser.id ? updated : u));

      if (isFirebaseConfigured && db) {
        const userDocRef = doc(db, 'users', currentUser.id);
        updateDoc(userDocRef, { activeMode: mode }).catch(err => {
          console.warn('[CONEXA AUTH] Error saving activeMode to Firestore:', err);
        });
      }
    }

    return true;
  };

  const toggleFavorite = (proId: string) => {
    setFavorites(prev => 
      prev.includes(proId) ? prev.filter(id => id !== proId) : [...prev, proId]
    );
  };

  const sharePhoneWithUser = (conversationId: string, recipientId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          sharedPhoneBySender: c.participantIds[0] === currentUser.id ? true : c.sharedPhoneBySender,
          sharedPhoneByReceiver: c.participantIds[1] === currentUser.id ? true : c.sharedPhoneByReceiver
        };
      }
      return c;
    }));

    sendMessage(
      conversationId,
      `📱 ${currentUser.name} compartió voluntariamente su número de teléfono privado: ${currentUser.phonePrivate}`,
      'SHARED_PHONE'
    );
  };

  const shareAddressWithUser = (conversationId: string, recipientId: string) => {
    const exactAddress = currentUser.location.exactAddressPrivate || 'Dirección no provista';
    
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          sharedAddressBySender: c.participantIds[0] === currentUser.id ? true : c.sharedAddressBySender,
          sharedAddressByReceiver: c.participantIds[1] === currentUser.id ? true : c.sharedAddressByReceiver
        };
      }
      return c;
    }));

    sendMessage(
      conversationId,
      `📍 ${currentUser.name} compartió voluntariamente su domicilio exacto para la visita: ${exactAddress}`,
      'SHARED_ADDRESS'
    );
  };

  const sendMessage = (conversationId: string, content: string, type: Message['type'] = 'TEXT', quoteData?: Quote) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      content,
      quoteData
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: type === 'SHARED_PHONE' ? '📱 Teléfono compartido' : type === 'SHARED_ADDRESS' ? '📍 Domicilio compartido' : type === 'QUOTE_PROPOSAL' ? '📋 Presupuesto enviado' : content,
          lastMessageTime: newMsg.createdAt
        };
      }
      return c;
    }));
  };

  const createConversation = (targetUserId: string): string => {
    const existing = conversations.find(c => 
      c.participantIds.includes(currentUser.id) && c.participantIds.includes(targetUserId)
    );
    if (existing) return existing.id;

    const targetUser = users.find(u => u.id === targetUserId);
    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participantIds: [currentUser.id, targetUserId],
      otherUser: {
        id: targetUserId,
        name: targetUser?.name || 'Usuario CONEXA',
        avatar: targetUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        profession: targetUser?.professionName,
        isIdentityVerified: targetUser?.isIdentityVerified,
        isProfessionalVerified: targetUser?.isProfessionalVerified
      },
      lastMessage: 'Conversación iniciada',
      lastMessageTime: 'Ahora',
      unreadCount: 0,
      sharedPhoneBySender: false,
      sharedPhoneByReceiver: false,
      sharedAddressBySender: false,
      sharedAddressByReceiver: false
    };

    setConversations(prev => [newConv, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newConvId]: [
        {
          id: `m-init-${Date.now()}`,
          conversationId: newConvId,
          senderId: 'system',
          senderName: 'CONEXA',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'SYSTEM',
          content: '🔒 CONEXA PRIVACIDAD: La conversación está protegida. Tu número telefónico y domicilio exacto NO son visibles hasta que los compartas voluntariamente.'
        }
      ]
    }));

    return newConvId;
  };

  const createServiceRequest = async (reqData: Omit<ServiceRequest, 'id' | 'clientId' | 'clientName' | 'clientAvatar' | 'createdAt' | 'status' | 'quotesCount'>) => {
    const newReq: ServiceRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientAvatar: currentUser.avatar,
      createdAt: new Date().toLocaleDateString('es-AR'),
      status: 'REQUEST_CREATED',
      quotesCount: 0
    };
    setRequests(prev => [newReq, ...prev]);

    if (db) {
      try {
        await setDoc(doc(db, 'service_requests', newReq.id), cleanFirestoreData(newReq));
      } catch (e) {
        console.warn('[Firestore] Error guardando solicitud de servicio:', e);
      }
    }
  };

  const submitQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('es-AR'),
      status: 'PENDING'
    };
    setQuotes(prev => [newQuote, ...prev]);

    // Update request status & count locally
    setRequests(prev => prev.map(r => {
      if (r.id === quoteData.requestId) {
        return {
          ...r,
          quotesCount: r.quotesCount + 1,
          status: 'QUOTES_RECEIVED'
        };
      }
      return r;
    }));

    if (db) {
      try {
        await setDoc(doc(db, 'quotes', newQuote.id), cleanFirestoreData(newQuote));
        const reqRef = doc(db, 'service_requests', quoteData.requestId);
        const reqSnap = await getDoc(reqRef);
        if (reqSnap.exists()) {
          const rData = reqSnap.data() as ServiceRequest;
          await updateDoc(reqRef, {
            quotesCount: (rData.quotesCount || 0) + 1,
            status: 'QUOTES_RECEIVED'
          });
        }
      } catch (e) {
        console.warn('[Firestore] Error guardando presupuesto:', e);
      }
    }

    // Find request to open chat with client
    const targetReq = requests.find(r => r.id === quoteData.requestId);
    if (targetReq) {
      const convId = createConversation(targetReq.clientId);
      sendMessage(convId, `Hola! Te envío un presupuesto formal para tu solicitud "${targetReq.title}".`, 'QUOTE_PROPOSAL', newQuote);
    }
  };

  const connectMercadoPago = async () => {
    if (authLoading || !authSessionReady) {
      throw new Error('Verificando sesión de autenticación. Por favor reintentá en unos segundos.');
    }

    if (!auth?.currentUser || !currentUser) {
      throw new Error('Usuario no autenticado o sesión de Firebase Auth expirada. Para vincular Mercado Pago primero debés iniciar sesión.');
    }

    // Immediately open popup window synchronously during user click gesture to avoid browser popup blockers
    const oauthWindow = window.open(
      'about:blank',
      'mercadopago_oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    if (!oauthWindow) {
      throw new Error('El navegador bloqueó la ventana emergente de Mercado Pago. Por favor permití las ventanas emergentes (popups) para este sitio.');
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/mercadopago/oauth/start', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok || !data.authorizationUrl) {
        if (!oauthWindow.closed) oauthWindow.close();

        if (response.status === 401) {
          throw new Error('Usuario no autenticado o sesión de Firebase Auth expirada.');
        }
        if (data.error === 'FIREBASE_ADMIN_NOT_CONFIGURED') {
          throw new Error('El backend de Firebase Admin no está configurado en el servidor.');
        }
        if (response.status === 503 || data.error === 'MERCADO_PAGO_NOT_CONFIGURED') {
          throw new Error('Mercado Pago no está configurado en el servidor (faltan variables de entorno MP_APP_ID / MP_CLIENT_SECRET).');
        }
        throw new Error(data.error || `Error HTTP ${response.status}: No se pudo obtener la URL de autorización de Mercado Pago.`);
      }

      oauthWindow.location.href = data.authorizationUrl;
    } catch (err: any) {
      if (oauthWindow && !oauthWindow.closed) {
        oauthWindow.close();
      }
      throw err;
    }
  };

  const getMercadoPagoStatus = async () => {
    if (authLoading || !authSessionReady) {
      return { connected: false, loading: true };
    }
    if (!auth?.currentUser || !currentUser) {
      return { connected: false, unauthenticated: true, errorCode: 'UNAUTHENTICATED_CLIENT' };
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/mercadopago/status', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) {
        return {
          connected: false,
          error: data.error || 'ERROR_UNKNOWN',
          reason: data.reason || '',
          detail: data.detail || '',
          errorCode: data.error || 'ERROR_HTTP_' + response.status
        };
      }
      return data;
    } catch (err: any) {
      return { connected: false, error: err?.message || 'Error de conexión', errorCode: 'NETWORK_ERROR' };
    }
  };

  const createMercadoPagoCheckout = async (transactionId: string) => {
    if (!auth?.currentUser) throw new Error('Debés iniciar sesión para pagar.');
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/mercadopago/checkout/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transactionId })
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.initPoint) throw new Error(data.error || 'No se pudo crear el checkout de Mercado Pago.');
    return data.initPoint as string;
  };

  const acceptQuote = async (quoteId: string) => {
    const targetQuote = quotes.find(q => q.id === quoteId);
    if (!targetQuote || !currentUser) throw new Error('Presupuesto o usuario no disponible.');

    if (auth?.currentUser && db) {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quoteId })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo crear la transacción.');
      }
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'ACCEPTED' } : q));
      setRequests(prev => prev.map(r => r.id === targetQuote.requestId ? { ...r, status: 'PROFESSIONAL_SELECTED' } : r));
      const transaction = data.transaction as Transaction;
      setTransactions(prev => [transaction, ...prev.filter(t => t.id !== transaction.id)]);
      return transaction;
    }

    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'ACCEPTED' } : q));
    setRequests(prev => prev.map(r => r.id === targetQuote.requestId ? { ...r, status: 'PROFESSIONAL_SELECTED' } : r));
    return null;
  };

  const completeJob = async (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REVIEW_PENDING' } : r));

    if (db) {
      try {
        await updateDoc(doc(db, 'service_requests', requestId), { status: 'REVIEW_PENDING' });
      } catch (e) {
        console.warn('[Firestore] Error completando trabajo:', e);
      }
    }
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'isVerifiedJob'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('es-AR'),
      isVerifiedJob: true
    };
    setReviews(prev => [newRev, ...prev]);

    // Recalculate target professional rating locally
    setUsers(prev => prev.map(u => {
      if (u.id === reviewData.professionalId) {
        const newCount = u.reviewCount + 1;
        const newRating = Number(((u.rating * u.reviewCount + reviewData.overallRating) / newCount).toFixed(1));
        return {
          ...u,
          reviewCount: newCount,
          rating: newRating,
          jobsCompleted: u.jobsCompleted + 1
        };
      }
      return u;
    }));

    if (db) {
      try {
        await setDoc(doc(db, 'reviews', newRev.id), cleanFirestoreData(newRev));
        const proRef = doc(db, 'users', reviewData.professionalId);
        const proSnap = await getDoc(proRef);
        if (proSnap.exists()) {
          const u = proSnap.data() as UserProfile;
          const newCount = (u.reviewCount || 0) + 1;
          const newRating = Number(((((u.rating || 0) * (u.reviewCount || 0)) + reviewData.overallRating) / newCount).toFixed(1));
          await updateDoc(proRef, cleanFirestoreData({
            reviewCount: newCount,
            rating: newRating,
            jobsCompleted: (u.jobsCompleted || 0) + 1
          }));
        }
      } catch (e) {
        console.warn('[Firestore] Error guardando reseña:', e);
      }
    }
  };

  const submitVerification = (type: 'IDENTITY' | 'PROFESSIONAL', documentName: string, docUrl: string) => {
    const newReq: VerificationRequest = {
      id: `ver-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      type,
      documentName,
      documentUrl: docUrl,
      status: 'PENDING',
      createdAt: 'Hace un instante'
    };
    setVerifications(prev => [newReq, ...prev]);

    // Update current user pending status
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        if (type === 'IDENTITY') return { ...u, identityVerificationStatus: 'PENDING' };
        return { ...u, professionalVerificationStatus: 'PENDING' };
      }
      return u;
    }));
    setCurrentUser(prev => {
      if (type === 'IDENTITY') return { ...prev, identityVerificationStatus: 'PENDING' };
      return { ...prev, professionalVerificationStatus: 'PENDING' };
    });
  };

  // Helper for Admin Audit Logging (Requirement 15)
  const logAdminAction = async (action: string, targetId: string, result: string) => {
    const logData = {
      adminUid: currentUser.id,
      action,
      targetId,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.DEV ? 'development' : 'production',
      result
    };
    console.log('[CONEXA AUDIT LOG]', logData);
    if (db) {
      try {
        const logId = `log-${Date.now()}`;
        await setDoc(doc(db, 'admin_audit_logs', logId), cleanFirestoreData(logData));
      } catch (err) {
        console.warn('[CONEXA AUDIT LOG] Error escribiendo log de auditoría en Firestore:', err);
      }
    }
  };

  const approveVerification = async (verificationId: string) => {
    const req = verifications.find(v => v.id === verificationId);
    if (!req) return;

    if (db) {
      try {
        await updateDoc(doc(db, 'verifications', verificationId), { status: 'VERIFIED' });
        await updateDoc(doc(db, 'users', req.userId), req.type === 'IDENTITY' 
          ? { isIdentityVerified: true, identityVerificationStatus: 'VERIFIED' }
          : { isProfessionalVerified: true, professionalVerificationStatus: 'VERIFIED' }
        );
        await logAdminAction('APPROVE_VERIFICATION', verificationId, 'SUCCESS');

        // On success, update local state
        setVerifications(prev => prev.map(v => v.id === verificationId ? { ...v, status: 'VERIFIED' } : v));
        setUsers(prev => prev.map(u => {
          if (u.id === req.userId) {
            if (req.type === 'IDENTITY') {
              return { ...u, isIdentityVerified: true, identityVerificationStatus: 'VERIFIED' };
            } else {
              return { ...u, isProfessionalVerified: true, professionalVerificationStatus: 'VERIFIED' };
            }
          }
          return u;
        }));
      } catch (e: any) {
        console.error('[CONEXA SECURITY] Error en Firestore al aprobar verificación:', e);
        await logAdminAction('APPROVE_VERIFICATION', verificationId, `FAILED: ${e.message || e}`);
        alert('Error al guardar en el servidor. La operación no se concretó.');
        throw e;
      }
    } else {
      setVerifications(prev => prev.map(v => v.id === verificationId ? { ...v, status: 'VERIFIED' } : v));
      setUsers(prev => prev.map(u => {
        if (u.id === req.userId) {
          if (req.type === 'IDENTITY') {
            return { ...u, isIdentityVerified: true, identityVerificationStatus: 'VERIFIED' };
          } else {
            return { ...u, isProfessionalVerified: true, professionalVerificationStatus: 'VERIFIED' };
          }
        }
        return u;
      }));
      await logAdminAction('APPROVE_VERIFICATION', verificationId, 'SUCCESS_LOCAL');
    }
  };

  const reportUser = async (reportedUserId: string, reason: UserReport['reason'], description: string) => {
    const reportedUser = users.find(u => u.id === reportedUserId);
    const newReport: UserReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reportedUserId,
      reportedUserName: reportedUser?.name || 'Usuario',
      reason,
      description,
      createdAt: 'Hace un momento',
      status: 'PENDING'
    };

    if (db) {
      try {
        await setDoc(doc(db, 'reports', newReport.id), cleanFirestoreData(newReport));
        setReports(prev => [newReport, ...prev]);
      } catch (e) {
        console.warn('[Firestore] Error guardando reporte:', e);
        alert('Error al guardar reporte en el servidor.');
      }
    } else {
      setReports(prev => [newReport, ...prev]);
    }
  };

  const blockUser = async (userIdToBlock: string) => {
    if (db) {
      try {
        await updateDoc(doc(db, 'users', userIdToBlock), { isBlocked: true });
        await logAdminAction('BLOCK_USER', userIdToBlock, 'SUCCESS');
        setUsers(prev => prev.map(u => u.id === userIdToBlock ? { ...u, isBlocked: true } : u));
      } catch (e: any) {
        console.error('[CONEXA SECURITY] Error al bloquear usuario:', e);
        await logAdminAction('BLOCK_USER', userIdToBlock, `FAILED: ${e.message || e}`);
        alert('Error al bloquear usuario en el servidor.');
        throw e;
      }
    } else {
      setUsers(prev => prev.map(u => u.id === userIdToBlock ? { ...u, isBlocked: true } : u));
      await logAdminAction('BLOCK_USER', userIdToBlock, 'SUCCESS_LOCAL');
    }
  };

  const resolveReport = async (reportId: string, action: 'DISMISSED' | 'ACTION_TAKEN') => {
    if (db) {
      try {
        await updateDoc(doc(db, 'reports', reportId), { status: action });
        await logAdminAction('RESOLVE_REPORT', reportId, action);
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action } : r));
      } catch (e: any) {
        console.error('[CONEXA SECURITY] Error al resolver reporte:', e);
        await logAdminAction('RESOLVE_REPORT', reportId, `FAILED_${action}: ${e.message || e}`);
        alert('Error al resolver reporte en el servidor.');
        throw e;
      }
    } else {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action } : r));
      await logAdminAction('RESOLVE_REPORT', reportId, `SUCCESS_LOCAL_${action}`);
    }
  };

  // Beta 1.0 System State
  const [betaConfig, setBetaConfig] = useState<BetaConfig>({
    isBetaActive: true,
    requireInviteCode: true,
    pilotCity: 'Santiago del Estero',
    allowNewRegistrations: true
  });

  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([
    {
      id: 'inv-1',
      code: 'CONEXA-SDE-001',
      maxUses: 100,
      usedCount: 18,
      expiresAt: '2026-12-31',
      userRole: 'PROFESSIONAL',
      isActive: true,
      createdAt: '2026-08-01',
      createdForNote: 'Profesionales Piloto Santiago del Estero'
    },
    {
      id: 'inv-2',
      code: 'CONEXA-CLIENTE-002',
      maxUses: 500,
      usedCount: 42,
      expiresAt: '2026-12-31',
      userRole: 'USER',
      isActive: true,
      createdAt: '2026-08-01',
      createdForNote: 'Particulares Santiago del Estero'
    }
  ]);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      userId: 'user-particular-1',
      userName: 'Gonzalo Morales',
      userRole: 'USER',
      category: 'LIKE',
      comment: 'Me dio mucha tranquilidad poder charlar con el plomero sin tener que darle mi número de teléfono enseguida.',
      createdAt: 'Hace 2 horas',
      status: 'NEW'
    },
    {
      id: 'fb-2',
      userId: 'pro-1',
      userName: 'Carlos Mansilla',
      userRole: 'PROFESSIONAL',
      category: 'SUGGESTION',
      comment: 'Estaría bueno poder subir fotos de trabajos anteriores en formato de galería cuando armamos el presupuesto.',
      createdAt: 'Ayer',
      status: 'REVIEWED'
    }
  ]);

  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([
    { id: 'ev-1', eventName: 'user_registered', userId: 'user-particular-1', timestamp: '2026-08-09T10:00:00Z', context: { city: 'Santiago del Estero' } },
    { id: 'ev-2', eventName: 'search_performed', userId: 'user-particular-1', timestamp: '2026-08-09T10:15:00Z', context: { query: 'electricista' } },
    { id: 'ev-3', eventName: 'conversation_started', userId: 'user-particular-1', timestamp: '2026-08-09T10:20:00Z', context: { targetProId: 'pro-1' } },
    { id: 'ev-4', eventName: 'phone_share_requested', userId: 'user-particular-1', timestamp: '2026-08-09T10:25:00Z' },
    { id: 'ev-5', eventName: 'service_request_created', userId: 'user-particular-1', timestamp: '2026-08-09T11:00:00Z', context: { category: 'Hogar & Construcción' } },
    { id: 'ev-6', eventName: 'quote_sent', userId: 'pro-1', timestamp: '2026-08-09T11:30:00Z', context: { priceArs: 38000 } },
    { id: 'ev-7', eventName: 'quote_accepted', userId: 'user-particular-1', timestamp: '2026-08-09T12:00:00Z' },
    { id: 'ev-8', eventName: 'job_completed', userId: 'pro-1', timestamp: '2026-08-09T15:00:00Z' },
    { id: 'ev-9', eventName: 'review_created', userId: 'user-particular-1', timestamp: '2026-08-09T15:30:00Z', context: { rating: 5 } }
  ]);

  // Track Analytics Event (PII Free)
  const trackEvent = (eventName: string, context?: Record<string, any>) => {
    const utms = getStoredUtms();
    const mergedContext = {
      ...context,
      ...(utms.utm_source ? { utm_source: utms.utm_source } : {}),
      ...(utms.utm_medium ? { utm_medium: utms.utm_medium } : {}),
      ...(utms.utm_campaign ? { utm_campaign: utms.utm_campaign } : {}),
      ...(utms.utm_content ? { utm_content: utms.utm_content } : {}),
      ...(utms.utm_term ? { utm_term: utms.utm_term } : {})
    };

    const newEv: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventName,
      userId: currentUser?.id || 'anonymous_visitor',
      timestamp: new Date().toISOString(),
      context: Object.keys(mergedContext).length > 0 ? mergedContext : undefined
    };
    setAnalyticsEvents(prev => [newEv, ...prev]);
    console.log('[CONEXA ANALYTICS]', eventName, newEv);
  };

  const submitFeedback = (category: FeedbackItem['category'], comment: string) => {
    const newFb: FeedbackItem = {
      id: `fb-${Date.now()}`,
      userId: currentUser?.id || 'anonymous',
      userName: currentUser?.name || 'Visitante',
      userRole: currentUser?.role || 'USER',
      category,
      comment,
      createdAt: 'Hace un instante',
      status: 'NEW'
    };
    setFeedbacks(prev => [newFb, ...prev]);
    trackEvent('feedback_submitted', { category });
  };

  const createInviteCode = async (code: string, maxUses: number, role: UserProfile['role'], note?: string) => {
    const newCode: InviteCode = {
      id: `inv-${Date.now()}`,
      code: code.trim().toUpperCase(),
      maxUses,
      usedCount: 0,
      expiresAt: '2026-12-31',
      userRole: role,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      createdForNote: note
    };

    if (db) {
      try {
        await setDoc(doc(db, 'invite_codes', newCode.id), cleanFirestoreData(newCode));
        await logAdminAction('CREATE_INVITE_CODE', newCode.id, newCode.code);
        setInviteCodes(prev => [newCode, ...prev]);
      } catch (e: any) {
        console.error('[CONEXA SECURITY] Error al crear código de invitación:', e);
        alert('Error al guardar el código de invitación en el servidor.');
        throw e;
      }
    } else {
      setInviteCodes(prev => [newCode, ...prev]);
      await logAdminAction('CREATE_INVITE_CODE', newCode.id, newCode.code);
    }
  };

  const toggleInviteCode = async (codeId: string) => {
    const code = inviteCodes.find(c => c.id === codeId);
    const newStatus = code ? !code.isActive : true;

    if (db) {
      try {
        await updateDoc(doc(db, 'invite_codes', codeId), cleanFirestoreData({ isActive: newStatus }));
        await logAdminAction('TOGGLE_INVITE_CODE', codeId, String(newStatus));
        setInviteCodes(prev => prev.map(c => c.id === codeId ? { ...c, isActive: newStatus } : c));
      } catch (e: any) {
        console.error('[CONEXA SECURITY] Error al cambiar estado de código:', e);
        alert('Error al actualizar código de invitación en el servidor.');
        throw e;
      }
    } else {
      setInviteCodes(prev => prev.map(c => c.id === codeId ? { ...c, isActive: !c.isActive } : c));
      await logAdminAction('TOGGLE_INVITE_CODE', codeId, String(newStatus));
    }
  };

  const updateBetaConfig = async (updates: Partial<BetaConfig>) => {
    if (db) {
      try {
        await setDoc(doc(db, 'beta_config', 'main'), cleanFirestoreData({ ...betaConfig, ...updates }), { merge: true });
        await logAdminAction('UPDATE_BETA_CONFIG', 'main', JSON.stringify(updates));
        setBetaConfig(prev => ({ ...prev, ...updates }));
      } catch (e: any) {
        console.error('[CONEXA SECURITY] Error al actualizar configuración beta:', e);
        alert('Error al actualizar configuración en el servidor.');
        throw e;
      }
    } else {
      setBetaConfig(prev => ({ ...prev, ...updates }));
      await logAdminAction('UPDATE_BETA_CONFIG', 'main', JSON.stringify(updates));
    }
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  // CONEXA RADAR System State
  const [radarOpportunities, setRadarOpportunities] = useState<RadarOpportunity[]>(() => {
    const saved = localStorage.getItem('conexa_radar_opportunities');
    return saved ? JSON.parse(saved) : initialRadarOpportunities;
  });

  const [radarStats, setRadarStats] = useState<RadarStats>(initialRadarStats);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('ASISTIDO');

  useEffect(() => {
    localStorage.setItem('conexa_radar_opportunities', JSON.stringify(radarOpportunities));
  }, [radarOpportunities]);

  const addRadarOpportunity = (opp: RadarOpportunity) => {
    setRadarOpportunities(prev => [opp, ...prev]);
    setRadarStats(prev => ({
      ...prev,
      totalDetected: prev.totalDetected + 1,
      newOpportunities: prev.newOpportunities + 1,
      highIntentCount: opp.intentScore >= 80 ? prev.highIntentCount + 1 : prev.highIntentCount,
      byCategory: {
        ...prev.byCategory,
        [opp.category]: (prev.byCategory[opp.category] || 0) + 1
      }
    }));
    trackEvent('radar_opportunity_detected', { category: opp.category, source: opp.source });
  };

  const updateRadarOpportunity = (id: string, updates: Partial<RadarOpportunity>) => {
    setRadarOpportunities(prev => prev.map(o => o.id === id ? { ...o, ...updates, lastUpdated: 'Hace un instante' } : o));
  };

  const deleteRadarOpportunity = (id: string) => {
    setRadarOpportunities(prev => prev.filter(o => o.id !== id));
  };

  const convertRadarOpportunity = (opportunityId: string, userId?: string) => {
    setRadarOpportunities(prev => prev.map(o => {
      if (o.id === opportunityId) {
        return {
          ...o,
          status: 'CONVERTED',
          conversionStatus: 'CONVERTED',
          lastUpdated: 'Hace un instante'
        };
      }
      return o;
    }));

    setRadarStats(prev => {
      const newConverted = prev.convertedUsers + 1;
      return {
        ...prev,
        convertedUsers: newConverted,
        conversionRate: Number(((newConverted / (prev.totalDetected || 1)) * 100).toFixed(1))
      };
    });

    trackEvent('radar_opportunity_converted', { opportunityId, userId });
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, switchUserRole, switchActiveMode, authLoading, authSessionReady,
      isAuthPortalOpen, openAuthPortal, closeAuthPortal,
      isAdmin, hasRole,
      users, categories, professions, reviews, requests, quotes, 
      conversations, messages, reports, verifications, notifications, transactions, favorites,
      betaConfig, inviteCodes, feedbacks, analyticsEvents,
      radarOpportunities, radarStats, approvalMode, setApprovalMode,
      addRadarOpportunity, updateRadarOpportunity, deleteRadarOpportunity, convertRadarOpportunity,
      searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
      selectedProfession, setSelectedProfession, selectedCity, setSelectedCity,
      maxDistanceKm, setMaxDistanceKm, onlyVerified, setOnlyVerified,
      toggleFavorite, sharePhoneWithUser, shareAddressWithUser, sendMessage,
      createConversation, createServiceRequest, submitQuote, acceptQuote, connectMercadoPago, createMercadoPagoCheckout, getMercadoPagoStatus, completeJob,
      addReview, submitVerification, approveVerification, reportUser, blockUser,
      resolveReport, markNotificationRead, deleteAccount,
      trackEvent, submitFeedback, createInviteCode, toggleInviteCode, updateBetaConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
