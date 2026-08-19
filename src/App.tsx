import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation, MainTab } from './components/Navigation';
import { PrivacyBanner } from './components/PrivacyBanner';
import { ProfessionalCard } from './components/ProfessionalCard';
import { ProfessionalDetailModal } from './components/ProfessionalDetailModal';
import { MapComponent } from './components/MapComponent';
import { ChatWindow } from './components/ChatWindow';
import { ServiceRequestForm } from './components/ServiceRequestForm';
import { RequestsList } from './components/RequestsList';
import { QuoteModal } from './components/QuoteModal';
import { ReviewModal } from './components/ReviewModal';
import { VerificationModal } from './components/VerificationModal';
import { AdminPanel } from './components/AdminPanel';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { FeedbackModal } from './components/FeedbackModal';
import { OnboardingModal } from './components/OnboardingModal';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { BecomeProfessionalModal } from './components/BecomeProfessionalModal';
import { DemandLanding } from './components/radar/DemandLanding';
import { LandingPage } from './components/LandingPage';
import { AuthPortal } from './components/AuthPortal';
import { UserProfile, ServiceRequest, Quote } from './types';
import { 
  Search, SlidersHorizontal, MapPin, Briefcase, Star, 
  ShieldCheck, MessageSquare, PlusCircle, CheckCircle2, Heart, Award, Sparkles, Filter,
  MessageSquarePlus, HelpCircle, Check, AlertCircle, Wrench, Droplet, Car, Sparkle, Home, Smartphone,
  Users, User, ArrowRight, X
} from 'lucide-react';


const MainAppContent: React.FC = () => {
  const { 
    currentUser, users, categories, professions, searchQuery, setSearchQuery, 
    selectedCategory, setSelectedCategory, selectedProfession, setSelectedProfession,
    selectedCity, setSelectedCity, maxDistanceKm, setMaxDistanceKm, onlyVerified, setOnlyVerified,
    conversations, createConversation, favorites, requests, switchActiveMode,
    isAuthPortalOpen, closeAuthPortal 
  } = useApp();

  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('INICIO');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Modals State
  const [selectedProfessional, setSelectedProfessional] = useState<UserProfile | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isServiceRequestFormOpen, setIsServiceRequestFormOpen] = useState(false);
  const [quoteTargetRequest, setQuoteTargetRequest] = useState<ServiceRequest | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLandingPreviewOpen, setIsLandingPreviewOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isRoleSelectionModalOpen, setIsRoleSelectionModalOpen] = useState(false);
  const [isBecomeProModalOpen, setIsBecomeProModalOpen] = useState(false);
  const [onboardingRoleMode, setOnboardingRoleMode] = useState<'CLIENT' | 'PROFESSIONAL'>('CLIENT');

  // Filter professionals list
  const filteredProfessionals = users.filter(u => {
    if (!u.isProfessional) return false;
    if (u.isBlocked) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchProf = u.professionName?.toLowerCase().includes(q);
      const matchDesc = u.description?.toLowerCase().includes(q);
      const matchSpec = u.specialties?.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchProf && !matchDesc && !matchSpec) return false;
    }

    // Category match
    if (selectedCategory) {
      const profsInCat = professions.filter(p => p.categoryId === selectedCategory).map(p => p.name.toLowerCase());
      const uProf = u.professionName?.toLowerCase() || '';
      const matchCat = profsInCat.some(pName => uProf.includes(pName));
      if (!matchCat) return false;
    }

    // Verified only filter
    if (onlyVerified && (!u.isIdentityVerified || !u.isProfessionalVerified)) {
      return false;
    }

    return true;
  });

  const handleStartChatWithPro = (pro: UserProfile) => {
    const convId = createConversation(pro.id);
    setActiveConversationId(convId);
    setActiveTab('MENSAJES');
  };

  const handleRequestQuote = (pro: UserProfile) => {
    setIsServiceRequestFormOpen(true);
  };

  if (!currentUser) {
    return (
      <LandingPage 
        onEnterApp={() => {
          // If the visitor triggers direct entry, we ensure auth state is ready
        }}
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/50 to-sky-100/60 text-slate-900 font-sans pb-28 relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Ambient Glowing Orbs for Frosted Glass Refraction */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-1/3 -right-32 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-32 left-1/4 w-[32rem] h-[32rem] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <Header 
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenVerifications={() => setIsVerificationModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenRegisterModal={() => setIsRoleSelectionModalOpen(true)}
        onOpenBecomePro={() => setIsBecomeProModalOpen(true)}
        onOpenLanding={() => setIsLandingPreviewOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Privacy Banner */}
        <PrivacyBanner />

        {/* View Switcher based on Navigation Tabs / Admin mode */}
        {isLandingPreviewOpen ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
            <div className="sticky top-3 right-4 z-50 flex justify-end px-4 pointer-events-none">
              <button
                onClick={() => setIsLandingPreviewOpen(false)}
                className="pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <X size={15} />
                <span>Volver a la App</span>
              </button>
            </div>
            <LandingPage onEnterApp={() => setIsLandingPreviewOpen(false)} />
          </div>
        ) : isAdminPanelOpen ? (
          <div className="space-y-4">
            <button 
              onClick={() => setIsAdminPanelOpen(false)}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/60 shadow-xs"
            >
              ← Volver a la aplicación principal
            </button>
            <AdminPanel onOpenLandingPreview={() => setIsLandingPreviewOpen(true)} />
          </div>
        ) : (
          <>
            {/* TAB 1: INICIO */}
            {activeTab === 'INICIO' && (
              <div className="space-y-6 animate-fade-in">
                {/* Adaptive Hero Banner by Active Mode */}
                {(currentUser.activeMode === 'PROFESSIONAL' || (!currentUser.activeMode && currentUser.isProfessional)) ? (
                  /* MODO PROFESIONAL HERO */
                  <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-teal-950/90 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 relative overflow-hidden space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <Wrench size={13} />
                          🧰 Modo Profesional • {selectedCity}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          Encontrá nuevos trabajos
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl">
                          Revisá solicitudes de clientes cercanos, enviá presupuestos y gestioná tus proyectos con privacidad protegida.
                        </p>
                      </div>

                      <button
                        onClick={() => switchActiveMode('CLIENT')}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-blue-200 border border-white/20 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors shrink-0 backdrop-blur-md cursor-pointer"
                      >
                        <span>👤 Cambiar a Modo Cliente</span>
                      </button>
                    </div>

                    {/* Professional Metrics Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                        <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider">Solicitudes Cercanas</p>
                        <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{requests.length} <span className="text-xs font-semibold text-slate-300">pedidos</span></p>
                      </div>
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                        <p className="text-[10px] text-blue-300 font-extrabold uppercase tracking-wider">Presupuestos Enviados</p>
                        <p className="text-xl sm:text-2xl font-black text-white mt-0.5">2 <span className="text-xs font-semibold text-slate-300">activos</span></p>
                      </div>
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                        <p className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">Reputación</p>
                        <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{currentUser.rating || 4.9} ★ <span className="text-xs font-semibold text-slate-300">({currentUser.reviewCount || 87})</span></p>
                      </div>
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                        <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider">Trabajos Realizados</p>
                        <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{currentUser.jobsCompleted || 127} <span className="text-xs font-semibold text-slate-300">listos</span></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveTab('SOLICITUDES')}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Ver Solicitudes Compatibles ({requests.length})</span>
                      </button>
                      <button
                        onClick={() => setIsBecomeProModalOpen(true)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/20 transition-colors cursor-pointer"
                      >
                        Editar Mi Perfil Profesional
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MODO CLIENTE HERO */
                  <div className="bg-slate-900/80 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="max-w-2xl space-y-3 relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-blue-300 border border-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1">
                            📍 {selectedCity} • Conexión Privada
                          </span>

                          <button
                            onClick={() => {
                              setOnboardingRoleMode('CLIENT');
                              setIsOnboardingModalOpen(true);
                            }}
                            className="text-[11px] font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <HelpCircle size={13} />
                            ¿Cómo funciona la privacidad?
                          </button>
                        </div>

                        {currentUser.hasProfessionalProfile || currentUser.isProfessional ? (
                          <button
                            onClick={() => switchActiveMode('PROFESSIONAL')}
                            className="text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Wrench size={13} />
                            Cambiar a Modo Profesional 🧰
                          </button>
                        ) : null}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white tracking-tight">
                        Contame qué necesitás...
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                        Encontrá profesionales confiables en Santiago del Estero. Chateá primero sin revelar tu teléfono ni domicilio.
                      </p>

                      {/* Interactive Search Field */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Ej: "Contame qué necesitás..." (Electricista, Plomero, Mecánico)'
                            className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/50 shadow-lg"
                          />
                        </div>
                        <button
                          onClick={() => setActiveTab('BUSCAR')}
                          className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-blue-600/30 transition-all shrink-0 border border-white/20 active:scale-95 cursor-pointer"
                        >
                          Buscar Profesionales
                        </button>
                      </div>

                      {/* Quick Category Suggestion Chips */}
                      <div className="pt-2 flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="text-slate-400 font-semibold">¿Qué necesitás hoy?:</span>
                        {[
                          { label: '🔧 Electricista', term: 'electricista' },
                          { label: '🚰 Plomero', term: 'plomero' },
                          { label: '🚗 Mecánico', term: 'mecánico' },
                          { label: '🧹 Limpieza', term: 'limpieza' },
                          { label: '🏠 Albañil', term: 'albañil' },
                          { label: '📱 Técnico', term: 'técnico' }
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchQuery(chip.term);
                              setActiveTab('BUSCAR');
                            }}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 rounded-xl font-medium transition-colors cursor-pointer"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}


                {/* Categories Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Categorías Principales</span>
                    </h3>
                    {selectedCategory && (
                      <button 
                        onClick={() => setSelectedCategory(null)} 
                        className="text-xs text-blue-600 font-semibold hover:underline bg-white/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/60"
                      >
                        Limpiar filtro
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                          setActiveTab('BUSCAR');
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                          selectedCategory === cat.id 
                            ? 'bg-blue-600/90 backdrop-blur-md text-white border-blue-400/60 shadow-lg shadow-blue-600/25 scale-[1.02]' 
                            : 'bg-white/60 backdrop-blur-md text-slate-800 border-white/70 hover:bg-white/80 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`p-2 rounded-xl w-fit ${selectedCategory === cat.id ? 'bg-white/20 backdrop-blur-sm' : 'bg-blue-500/10 text-blue-600'}`}>
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-tight">{cat.name}</p>
                          <p className={`text-[10px] mt-0.5 ${selectedCategory === cat.id ? 'text-blue-100' : 'text-slate-500'}`}>
                            {cat.description.slice(0, 32)}...
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Professionals */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Profesionales Destacados en {selectedCity}</h3>
                      <p className="text-xs text-slate-500">Con verificación de identidad y calificaciones en trabajos previos</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('BUSCAR')} 
                      className="text-xs text-blue-600 font-bold hover:underline bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/60 shadow-2xs"
                    >
                      Ver todos ({filteredProfessionals.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProfessionals.slice(0, 6).map(pro => (
                      <ProfessionalCard
                        key={pro.id}
                        professional={pro}
                        onViewDetail={(p) => {
                          setSelectedProfessional(p);
                          setIsProModalOpen(true);
                        }}
                        onContact={(p) => handleStartChatWithPro(p)}
                      />
                    ))}
                  </div>
                </div>

                {/* Solicitudes & Quotes Pipeline Component */}
                <RequestsList 
                  onSendQuoteForRequest={(req) => {
                    setQuoteTargetRequest(req);
                    setIsQuoteModalOpen(true);
                  }}
                  onOpenChatWithClient={(clientId) => {
                    const convId = createConversation(clientId);
                    setActiveConversationId(convId);
                    setActiveTab('MENSAJES');
                  }}
                />
              </div>
            )}

            {/* TAB 2: BUSCAR */}
            {activeTab === 'BUSCAR' && (
              <div className="space-y-4 animate-fade-in">
                {/* Search Header Controls */}
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-xl shadow-slate-900/5 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por profesión, especialidad o nombre..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

                    <button
                      onClick={() => setOnlyVerified(!onlyVerified)}
                      className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                        onlyVerified 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                          : 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white border border-white/80'
                      }`}
                    >
                      <ShieldCheck size={16} />
                      <span>Solo Verificados</span>
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold pt-1">
                    <span className="text-slate-400 shrink-0">Categoría:</span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3.5 py-1 rounded-full border shrink-0 transition-all ${
                        !selectedCategory ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white/60 backdrop-blur-md text-slate-700 border-white/80 hover:bg-white'
                      }`}
                    >
                      Todas
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                        className={`px-3.5 py-1 rounded-full border shrink-0 transition-all ${
                          selectedCategory === c.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white/60 backdrop-blur-md text-slate-700 border-white/80 hover:bg-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Results */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 font-semibold px-1">
                    Se encontraron <strong className="text-slate-900">{filteredProfessionals.length}</strong> profesionales compatibles
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProfessionals.map(pro => (
                      <ProfessionalCard
                        key={pro.id}
                        professional={pro}
                        onViewDetail={(p) => {
                          setSelectedProfessional(p);
                          setIsProModalOpen(true);
                        }}
                        onContact={(p) => handleStartChatWithPro(p)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MAPA */}
            {activeTab === 'MAPA' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-xl shadow-slate-900/5">
                  <h2 className="font-bold text-slate-900 text-base">Mapa de Profesionales Cercanos</h2>
                  <p className="text-xs text-slate-500">
                    Ubicaciones mediante geocercas aproximadas. La dirección exacta nunca se expone públicamente.
                  </p>
                </div>

                <MapComponent
                  professionals={filteredProfessionals}
                  selectedCity={selectedCity}
                  onSelectProfessional={(p) => {
                    setSelectedProfessional(p);
                    setIsProModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* TAB 4: MENSAJES */}
            {activeTab === 'MENSAJES' && (
              <div className="h-[600px] animate-fade-in">
                {activeConversationId ? (
                  <ChatWindow
                    conversation={conversations.find(c => c.id === activeConversationId)!}
                    onBack={() => setActiveConversationId(null)}
                    onRequestQuoteClick={() => setIsServiceRequestFormOpen(true)}
                  />
                ) : (
                  <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl h-full flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-md">
                      <h2 className="font-bold text-slate-900 text-base">Mensajes y Chats Privados</h2>
                      <p className="text-xs text-slate-500">Comunicate con profesionales y clientes sin revelar tu teléfono.</p>
                    </div>

                    <div className="divide-y divide-slate-100/80 overflow-y-auto flex-1">
                      {conversations.length > 0 ? (
                        conversations.map(conv => (
                          <div
                            key={conv.id}
                            onClick={() => setActiveConversationId(conv.id)}
                            className="p-4 flex items-center justify-between gap-3 hover:bg-white/80 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img src={conv.otherUser.avatar} alt={conv.otherUser.name} className="w-12 h-12 rounded-2xl object-cover border border-white/80 shadow-xs" />
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>{conv.otherUser.name}</span>
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-1">{conv.lastMessage}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block font-medium">{conv.lastMessageTime}</span>
                              {conv.unreadCount > 0 && (
                                <span className="inline-block px-2 py-0.5 bg-rose-500 text-white font-bold text-[10px] rounded-full mt-1 shadow-xs">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400 space-y-2">
                          <MessageSquare size={36} className="mx-auto text-slate-300" />
                          <p className="text-xs font-semibold">No tenés conversaciones privadas activas.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PERFIL */}
            {activeTab === 'PERFIL' && (
              <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
                <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-2xl space-y-4 text-xs">
                  {/* Account Header */}
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
                    <div className="space-y-1">
                      <h2 className="font-bold text-slate-900 text-lg">{currentUser.name}</h2>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block">
                          Tu cuenta CONEXA
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium">📍 {currentUser.location.approxZone}</p>
                    </div>
                  </div>

                  {/* Modos Disponibles Section */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm rounded-2xl border border-slate-200/80 space-y-3">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Tu cuenta CONEXA</h3>
                      <p className="text-[11px] text-slate-500 font-semibold">Modos disponibles en tu cuenta unificada:</p>
                    </div>

                    <div className="space-y-2 bg-white/80 p-3 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span className="text-emerald-600 font-black">☑</span>
                          <span>👤 Cliente</span>
                        </div>
                        <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-full">
                          Activo
                        </span>
                      </div>

                      {(currentUser.hasProfessionalProfile || currentUser.isProfessional) ? (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span className="text-emerald-600 font-black">☑</span>
                            <span>🧰 Profesional</span>
                          </div>
                          <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                            Activo
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsRoleSelectionModalOpen(true)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer text-left shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span>➕</span>
                            <span>🧰 Crear perfil profesional</span>
                          </div>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold">
                            Gratis
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Active Mode Control */}
                    <div className="pt-1">
                      <p className="font-extrabold text-slate-900 text-xs mb-2">Cambiar Modo de Uso Actual:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => switchActiveMode('CLIENT')}
                          className={`p-2.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            (currentUser.activeMode === 'CLIENT' || (!currentUser.activeMode && !currentUser.isProfessional))
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>👤 Modo Cliente</span>
                        </button>

                        <button
                          onClick={() => {
                            if (!currentUser.hasProfessionalProfile && !currentUser.isProfessional) {
                              setIsRoleSelectionModalOpen(true);
                            } else {
                              switchActiveMode('PROFESSIONAL');
                            }
                          }}
                          className={`p-2.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            currentUser.activeMode === 'PROFESSIONAL'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>🧰 Modo Profesional</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Private Data Card */}
                  <div className="p-3.5 bg-slate-50/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 space-y-2">
                    <h4 className="font-bold text-slate-900">Datos Privados (Confidenciales)</h4>
                    <p className="text-slate-600">📱 Teléfono: <strong className="text-slate-800">{currentUser.phonePrivate}</strong></p>
                    <p className="text-slate-600">📍 Domicilio: <strong className="text-slate-800">{currentUser.location.exactAddressPrivate || 'No provisto'}</strong></p>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">🔒 Solo se comparten mediante tu autorización explícita en el chat.</p>
                  </div>

                  {/* Profile Completeness Widget for Professionals */}
                  {(currentUser.isProfessional || currentUser.hasProfessionalProfile) && (
                    <div className="p-4 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 rounded-2xl border border-blue-200/80 space-y-2">
                      <div className="flex justify-between items-center font-bold text-slate-800 text-xs">
                        <span>Completuidad de Perfil Profesional</span>
                        <span className="text-blue-600 font-extrabold">85% Completo</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full w-[85%]" />
                      </div>
                      <p className="text-[11px] text-slate-600">
                        💡 <strong>Sugerencia:</strong> Agregá fotos de tus trabajos anteriores y solicitá la verificación de identidad para destacar ante los clientes en Santiago del Estero.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setIsRoleSelectionModalOpen(true)}
                      className="w-full p-3.5 bg-indigo-50/80 backdrop-blur-sm border border-indigo-200/80 text-indigo-900 font-bold rounded-2xl text-left hover:bg-indigo-100/80 transition-colors flex items-center justify-between shadow-2xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Users size={18} className="text-indigo-600" />
                        <span>¿Cómo vas a usar CONEXA? (Elegir o Cambiar Rol)</span>
                      </span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="w-full p-3.5 bg-blue-50/80 backdrop-blur-sm border border-blue-200/80 text-blue-900 font-bold rounded-2xl text-left hover:bg-blue-100/80 transition-colors flex items-center justify-between shadow-2xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Award size={18} className="text-blue-600" />
                        <span>Solicitar Verificación de Identidad / Matrícula</span>
                      </span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="w-full p-3.5 bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-800 font-bold rounded-2xl text-left hover:bg-white transition-colors flex items-center justify-between shadow-2xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-slate-600" />
                        <span>Ajustes de Privacidad & Descarga de Datos</span>
                      </span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button: Enviar Feedback */}
      <button
        onClick={() => setIsFeedbackModalOpen(true)}
        className="fixed bottom-20 right-4 sm:right-6 z-40 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-full shadow-2xl shadow-blue-600/40 flex items-center gap-2 border border-white/30 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
        title="Enviar feedback o reportar problemas"
      >
        <MessageSquarePlus size={16} />
        <span className="hidden sm:inline">Enviar feedback</span>
      </button>

      {/* Bottom Mobile-first Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsAdminPanelOpen(false);
          setActiveTab(tab);
        }}
        onCreateRequestClick={() => setIsServiceRequestFormOpen(true)}
      />

      {/* Modals */}
      <ProfessionalDetailModal
        professional={selectedProfessional}
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onStartChat={(pro) => handleStartChatWithPro(pro)}
        onRequestQuote={(pro) => handleRequestQuote(pro)}
      />

      <ServiceRequestForm
        isOpen={isServiceRequestFormOpen}
        onClose={() => setIsServiceRequestFormOpen(false)}
      />

      <QuoteModal
        request={quoteTargetRequest}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyParsedRequest={(data) => {
          setIsServiceRequestFormOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        roleMode={onboardingRoleMode}
        onStartProSetup={() => {
          setIsOnboardingModalOpen(false);
          setIsBecomeProModalOpen(true);
        }}
      />

      <RoleSelectionModal
        isOpen={isRoleSelectionModalOpen}
        onClose={() => setIsRoleSelectionModalOpen(false)}
        onSelectRole={(role) => {
          setIsRoleSelectionModalOpen(false);
          if (role === 'CLIENT') {
            switchActiveMode('CLIENT');
            setOnboardingRoleMode('CLIENT');
            setIsOnboardingModalOpen(true);
          } else if (role === 'ADMIN') {
            const success = switchActiveMode('ADMIN');
            if (success) {
              setIsAdminPanelOpen(true);
            }
          } else {
            switchActiveMode('PROFESSIONAL');
            setOnboardingRoleMode('PROFESSIONAL');
            setIsOnboardingModalOpen(true);
          }
        }}
        onSelectClient={() => {
          setIsRoleSelectionModalOpen(false);
          switchActiveMode('CLIENT');
          setOnboardingRoleMode('CLIENT');
          setIsOnboardingModalOpen(true);
        }}
        onSelectProfessional={() => {
          setIsRoleSelectionModalOpen(false);
          switchActiveMode('PROFESSIONAL');
          setOnboardingRoleMode('PROFESSIONAL');
          setIsOnboardingModalOpen(true);
        }}
        onSelectAdmin={() => {
          setIsRoleSelectionModalOpen(false);
          const success = switchActiveMode('ADMIN');
          if (success) {
            setIsAdminPanelOpen(true);
          }
        }}
      />

      <BecomeProfessionalModal
        isOpen={isBecomeProModalOpen}
        onClose={() => setIsBecomeProModalOpen(false)}
        onSuccess={() => {
          setIsBecomeProModalOpen(false);
          switchActiveMode('PROFESSIONAL');
        }}
      />

      {isAuthPortalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            <button 
              onClick={closeAuthPortal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors z-50"
              aria-label="Cerrar autenticación"
            >
              <X size={18} />
            </button>
            <AuthPortal />
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
