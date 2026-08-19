import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, KeyRound, Mail, User, Phone, CheckCircle2, AlertCircle, Wrench, Users } from 'lucide-react';
import { Role } from '../types';
import { useApp } from '../context/AppContext';

export const AuthPortal: React.FC = () => {
  const { closeAuthPortal, authSessionReady, authLoading, currentUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('USER');
  const [loading, setLoading] = useState(false);
  const [isAwaitingSessionSync, setIsAwaitingSessionSync] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Monitor AppContext states reactively to finalize session sync and close the portal
  useEffect(() => {
    if (isAwaitingSessionSync) {
      if (auth.currentUser && currentUser && authSessionReady && !authLoading) {
        setSuccess('Sesión sincronizada e iniciada correctamente.');
        closeAuthPortal?.();
        setIsAwaitingSessionSync(false);
      }
    }
  }, [isAwaitingSessionSync, currentUser, authSessionReady, authLoading, closeAuthPortal]);

  if (!auth) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-900 rounded-3xl text-center space-y-2">
        <AlertCircle className="mx-auto text-rose-600" size={36} />
        <h4 className="font-bold">Error del Sistema</h4>
        <p className="text-xs">El servicio de Firebase Auth no está inicializado en este entorno.</p>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (db) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          // Initialize user document if first time login
          await setDoc(userDocRef, {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || name || 'Usuario Conexa',
            email: firebaseUser.email || '',
            phonePrivate: phone || '',
            avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            role: selectedRole,
            joinedDate: new Date().toLocaleDateString('es-AR'),
            activeMode: selectedRole,
            isProfessional: selectedRole === 'PROFESSIONAL',
            hasProfessionalProfile: selectedRole === 'PROFESSIONAL',
            professionName: selectedRole === 'PROFESSIONAL' ? 'Profesional Contratista' : undefined,
            location: {
              city: 'Santiago del Estero',
              province: 'Santiago del Estero',
              country: 'Argentina',
              lat: -27.7834,
              lng: -64.2642,
              approxZone: 'Santiago del Estero - Centro'
            },
            isIdentityVerified: false,
            identityVerificationStatus: 'NONE',
            rating: selectedRole === 'PROFESSIONAL' ? 5.0 : 0,
            reviewCount: 0,
            jobsCompleted: 0,
            trustScore: 60,
            availabilityStatus: 'DISPONIBLE'
          });
        }
      }

      await firebaseUser.getIdToken(true);
      setSuccess('Sesión de Google iniciada. Sincronizando perfil con CONEXA...');
      setIsAwaitingSessionSync(true);
    } catch (err: any) {
      console.error('[CONEXA GOOGLE AUTH ERROR]', err);
      setError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        if (!firebaseUser) {
          throw new Error('No se pudo verificar el usuario autenticado.');
        }
        await firebaseUser.getIdToken(true);
        setSuccess('Sesión iniciada correctamente. Sincronizando perfil con CONEXA...');
        setIsAwaitingSessionSync(true);
      } else {
        // Sign Up
        if (!name.trim()) {
          throw new Error('Por favor ingresá tu nombre completo.');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        if (!firebaseUser) {
          throw new Error('No se pudo registrar el usuario en Firebase Auth.');
        }

        // Update Auth Profile
        await updateProfile(firebaseUser, {
          displayName: name,
          photoURL: selectedRole === 'PROFESSIONAL' 
            ? 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=150'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
        });

        // Initialize user document in Firestore to secure their role mapping
        if (db) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userDocRef, {
            id: firebaseUser.uid,
            name,
            email,
            phonePrivate: phone,
            avatar: selectedRole === 'PROFESSIONAL' 
              ? 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=150'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            role: selectedRole,
            joinedDate: new Date().toLocaleDateString('es-AR'),
            activeMode: selectedRole,
            isProfessional: selectedRole === 'PROFESSIONAL',
            hasProfessionalProfile: selectedRole === 'PROFESSIONAL',
            professionName: selectedRole === 'PROFESSIONAL' ? 'Profesional Contratista' : undefined,
            location: {
              city: 'Santiago del Estero',
              province: 'Santiago del Estero',
              country: 'Argentina',
              lat: -27.7834,
              lng: -64.2642,
              approxZone: 'Santiago del Estero - Centro'
            },
            isIdentityVerified: false,
            identityVerificationStatus: 'NONE',
            rating: selectedRole === 'PROFESSIONAL' ? 5.0 : 0,
            reviewCount: 0,
            jobsCompleted: 0,
            trustScore: 60,
            availabilityStatus: 'DISPONIBLE'
          });
        }

        await firebaseUser.getIdToken(true);
        setSuccess('¡Cuenta registrada correctamente! Sincronizando perfil con CONEXA...');
        setIsAwaitingSessionSync(true);
      }
    } catch (err: any) {
      console.error('[CONEXA AUTH ERROR]', err);
      let errMsg = err.message || 'Ocurrió un error inesperado.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Este correo electrónico ya está registrado.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Contraseña o credenciales incorrectas.';
      } else if (err.code === 'auth/user-not-found') {
        errMsg = 'No se encontró un usuario con este correo.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'El método de autenticación con Correo/Contraseña no está habilitado en el proyecto activo de Firebase. Revisá Firebase Console > Authentication > Sign-in method y confirmá que el projectId de firebase-applet-config.json coincida con el proyecto real.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg rotate-3">
          <Shield size={28} className="-rotate-3" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">CONEXA</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Plataforma de contratación segura con resguardo absoluto de datos privados para Santiago del Estero.
        </p>
      </div>

      {/* Login / Register Tab Switcher */}
      <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/40 text-xs">
        <button
          onClick={() => { setIsLogin(true); setError(null); }}
          className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError(null);
            if (auth.currentUser) {
              auth.signOut().catch(e => console.error("Error signing out prior user:", e));
            }
          }}
          className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle size={15} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        {!isLogin && (
          <>
            {/* Registration Role Selection Card */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">¿Cómo vas a usar la plataforma?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('USER')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === 'USER'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Users size={18} className={selectedRole === 'USER' ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="font-bold">Como Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('PROFESSIONAL')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === 'PROFESSIONAL'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Wrench size={18} className={selectedRole === 'PROFESSIONAL' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="font-bold">Como Profesional</span>
                </button>
              </div>
            </div>

            {/* Full Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Private Phone Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Celular (Privado y Protegido)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  placeholder="Ej. 3855550192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                />
              </div>
            </div>
          </>
        )}

        {/* Email Address Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="email"
              required
              placeholder="Ej. juan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Contraseña</label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || isAwaitingSessionSync}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
        >
          {loading || isAwaitingSessionSync ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Segura'}</span>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">o bien</span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || isAwaitingSessionSync}
          className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continuar con Google</span>
        </button>
      </form>
    </div>
  );
};
