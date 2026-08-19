import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, MapPin, Bell, ShieldCheck, UserCheck, 
  Settings as SettingsIcon, ChevronDown, Award, Users,
  User, Wrench, RefreshCw, PlusCircle, ArrowLeftRight, LogIn, LogOut
} from 'lucide-react';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface HeaderProps {
  onOpenAiAssistant: () => void;
  onOpenSettings: () => void;
  onOpenVerifications: () => void;
  onOpenAdminPanel: () => void;
  onOpenRegisterModal: () => void;
  onOpenBecomePro: () => void;
  onOpenLanding?: () => void;
}

const CITIES = [
  'Santiago del Estero',
  'La Banda',
  'Buenos Aires',
  'Córdoba',
  'Rosario',
  'Tucumán'
];

export const Header: React.FC<HeaderProps> = ({
  onOpenAiAssistant,
  onOpenSettings,
  onOpenVerifications,
  onOpenAdminPanel,
  onOpenRegisterModal,
  onOpenBecomePro,
  onOpenLanding
}) => {
  const { 
    currentUser, users, switchUserRole, switchActiveMode, selectedCity, setSelectedCity, 
    notifications, markNotificationRead 
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const activeMode = currentUser.activeMode || (currentUser.isProfessional ? 'PROFESSIONAL' : 'CLIENT');
  const isAdminUser = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const isDevEnvironment = Boolean((import.meta as any).env?.DEV);

  const handleToggleMode = () => {
    if (activeMode === 'CLIENT') {
      if (!currentUser.hasProfessionalProfile && !currentUser.isProfessional) {
        onOpenBecomePro();
      } else {
        switchActiveMode('PROFESSIONAL');
      }
    } else {
      switchActiveMode('CLIENT');
    }
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl text-white sticky top-0 z-40 shadow-xl shadow-slate-950/10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30 tracking-wider border border-white/20">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg tracking-tight text-white leading-none">CONEXA</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full backdrop-blur-md">
                BETA 1.0
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full backdrop-blur-md hidden sm:inline-block">
                Santiago del Estero
              </span>
            </div>

            <p className="text-[11px] text-slate-300/80 font-medium hidden sm:block">
              Red de conexión privada y servicios locales
            </p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 text-xs text-slate-200 shadow-inner">
          <MapPin size={15} className="text-rose-400 shrink-0" />
          <span className="font-medium text-slate-300">Ciudad piloto:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
          >
            {CITIES.map(city => (
              <option key={city} value={city} className="bg-slate-900 text-white">
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Active Mode Primary Selector */}
          <button
            onClick={onOpenRegisterModal}
            className={`px-3 py-1.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 border backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer ${
              activeMode === 'ADMIN'
                ? 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border-amber-400/40'
                : activeMode === 'PROFESSIONAL'
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/40'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-400/40'
            }`}
            title="Abrir selector: ¿Cómo querés usar CONEXA?"
          >
            {activeMode === 'ADMIN' ? (
              <>
                <ShieldCheck size={14} className="text-amber-400" />
                <span>🔐 Modo Administrador</span>
              </>
            ) : activeMode === 'PROFESSIONAL' ? (
              <>
                <Wrench size={14} className="text-emerald-400" />
                <span>🧰 Modo Profesional</span>
              </>
            ) : (
              <>
                <User size={14} className="text-blue-400" />
                <span>👤 Modo Cliente</span>
              </>
            )}
            <ChevronDown size={14} className="text-slate-300 ml-0.5" />
          </button>

          {/* AI Assistant Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="p-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/25 border border-white/20 transition-all shrink-0 backdrop-blur-md active:scale-95"
            title="Asistente Inteligente IA"
          >
            <Sparkles size={15} className="animate-spin-slow text-amber-300" />
            <span className="hidden lg:inline">IA CONEXA</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors border border-white/10 backdrop-blur-md relative"
              aria-label="Notificaciones"
            >
              <Bell size={17} />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 top-12 w-72 sm:w-80 bg-white/85 backdrop-blur-2xl text-slate-900 rounded-3xl shadow-2xl border border-white/80 p-3 z-50 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100/80 pb-2">
                  <span className="font-bold text-slate-900 text-sm">Notificaciones</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {unreadNotifs.length} nuevas
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-2xl cursor-pointer transition-colors ${
                        n.read ? 'bg-white/50 text-slate-600' : 'bg-blue-50/80 text-slate-900 border border-blue-200/80 font-medium shadow-2xs'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">{n.body}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{n.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors border border-white/10 backdrop-blur-md"
            title="Configuración de Privacidad"
          >
            <SettingsIcon size={17} />
          </button>

          {/* User Account & Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="p-1 pl-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center gap-2 border border-white/15 transition-colors shadow-xs cursor-pointer"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 rounded-full object-cover border border-white/40"
              />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold leading-none text-white">{currentUser.name}</p>
                <p className="text-[10px] text-blue-300 font-semibold leading-tight">
                  {currentUser.isProfessional || currentUser.hasProfessionalProfile ? 'Cliente + Profesional' : 'Cliente'}
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-300" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-12 w-72 bg-white/95 backdrop-blur-2xl text-slate-900 rounded-3xl shadow-2xl border border-white/80 p-2.5 z-50 space-y-2 text-xs">
                {/* Account Header */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/80">
                  <div className="flex items-center gap-2.5">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-blue-400" />
                    <div>
                      <p className="font-black text-slate-900 text-sm">{currentUser.name}</p>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {currentUser.isProfessional || currentUser.hasProfessionalProfile ? '👤 Cliente + 🧰 Profesional' : '👤 Cliente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Registration / Onboarding Button */}
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    onOpenRegisterModal();
                  }}
                  className="w-full text-left p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-md transition-all"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle size={16} />
                    <span>Crear Cuenta / Elegir Rol</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold">
                    ¿Cómo vas a usar CONEXA?
                  </span>
                </button>

                {/* Convert to professional if not pro yet */}
                {(!currentUser.isProfessional && !currentUser.hasProfessionalProfile) ? (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenBecomePro();
                    }}
                    className="w-full text-left p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl font-bold flex items-center gap-2 transition-colors"
                  >
                    <Wrench size={16} className="text-emerald-600" />
                    <span>Convertite en Profesional</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenBecomePro();
                    }}
                    className="w-full text-left p-2 hover:bg-slate-100 rounded-2xl font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Wrench size={15} className="text-slate-500" />
                    <span>Editar datos de Profesional</span>
                  </button>
                )}

                {isDevEnvironment && (
                  <>
                    <div className="p-2 bg-slate-100 rounded-2xl text-slate-600 font-extrabold text-[10px] border border-slate-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Probar como otro usuario (DEV):</span>
                      <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black">TEST ONLY</span>
                    </div>

                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUserRole(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-2xl flex items-center justify-between transition-colors ${
                          currentUser.id === u.id ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? '👑 Admin' : u.isProfessional || u.hasProfessionalProfile ? 'Cliente + Profesional' : 'Cliente'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  {onOpenLanding && (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenLanding();
                      }}
                      className="w-full text-left p-2 hover:bg-slate-100 rounded-2xl font-bold text-slate-800 flex items-center gap-2"
                    >
                      <Sparkles size={15} className="text-emerald-600" />
                      <span>Ver Landing Page Pública</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenVerifications();
                    }}
                    className="w-full text-left p-2 hover:bg-slate-100 rounded-2xl font-bold text-blue-700 flex items-center gap-2"
                  >
                    <Award size={15} />
                    <span>Solicitar Verificación</span>
                  </button>

                  {currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' ? (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenAdminPanel();
                      }}
                      className="w-full text-left p-2 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-sm"
                    >
                      <ShieldCheck size={15} />
                      <span>Abrir Panel Admin</span>
                    </button>
                  ) : null}

                  {isFirebaseConfigured && (
                    <button
                      onClick={async () => {
                        setShowRoleMenu(false);
                        if (auth) {
                          await auth.signOut();
                        }
                      }}
                      className="w-full text-left p-2 hover:bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Cerrar Sesión</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
