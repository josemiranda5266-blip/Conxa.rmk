import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AuthPortal } from './AuthPortal';
import { 
  Search, Shield, ShieldCheck, MapPin, Zap, Clock, UserCheck, 
  ArrowRight, Sparkles, CheckCircle2, ChevronRight, Lock, 
  Radio, Wrench, Droplet, Hammer, Cpu, Flame, Smartphone,
  Users, MessageSquare, Star, Award, Check, EyeOff, AlertTriangle,
  Compass, ChevronDown, PhoneCall, ExternalLink, HelpCircle, X
} from 'lucide-react';
import { Role } from '../types';

interface LandingPageProps {
  onEnterApp?: () => void;
  onSelectCategory?: (categoryName: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onSelectCategory }) => {
  const { trackEvent, selectedCity, professions, categories } = useApp();

  // Auth / Action Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialIsLogin, setAuthInitialIsLogin] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<Role>('USER');
  const [authInitialProfession, setAuthInitialProfession] = useState('Electricista');
  const [quickSearchInput, setQuickSearchInput] = useState('');

  // Interactive Mockup Tab State
  const [activeMockupTab, setActiveMockupTab] = useState<'search' | 'list' | 'profile' | 'chat'>('search');

  // Sticky CTA on mobile scroll
  const [showStickyCta, setShowStickyCta] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // References for view analytics
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Track initial landing view on mount
  useEffect(() => {
    trackEvent('landing_view', { city: selectedCity });

    // Scroll listener for sticky CTA
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent, selectedCity]);

  // IntersectionObserver for section views
  useEffect(() => {
    const observerOptions = { threshold: 0.35 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === howItWorksRef.current) {
            trackEvent('how_it_works_view');
          } else if (entry.target === demoRef.current) {
            trackEvent('app_demo_view', { tab: activeMockupTab });
          }
        }
      });
    }, observerOptions);

    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (demoRef.current) observer.observe(demoRef.current);

    return () => observer.disconnect();
  }, [trackEvent, activeMockupTab]);

  // Handlers for CTAs
  const handleHeroCta = (query?: string) => {
    trackEvent('hero_cta_click', { query: query || quickSearchInput || 'general' });
    setAuthInitialRole('USER');
    setAuthInitialIsLogin(false);
    setIsAuthOpen(true);
  };

  const handleProCta = () => {
    trackEvent('professional_cta_click');
    setAuthInitialRole('PROFESSIONAL');
    setAuthInitialIsLogin(false);
    setIsAuthOpen(true);
  };

  const handleLoginClick = () => {
    trackEvent('login_cta_click');
    setAuthInitialIsLogin(true);
    setIsAuthOpen(true);
  };

  const handleFinalCta = () => {
    trackEvent('final_cta_click');
    setAuthInitialRole('USER');
    setAuthInitialIsLogin(false);
    setIsAuthOpen(true);
  };

  const handleQuickProfessionClick = (profName: string) => {
    trackEvent('quick_category_click', { profession: profName });
    if (onSelectCategory) {
      onSelectCategory(profName);
    }
    setAuthInitialProfession(profName);
    setAuthInitialRole('USER');
    setAuthInitialIsLogin(false);
    setIsAuthOpen(true);
  };

  const handleDirectAppEntry = () => {
    trackEvent('app_entry', { source: 'landing_direct' });
    if (onEnterApp) {
      onEnterApp();
    } else {
      setIsAuthOpen(true);
    }
  };

  const POPULAR_PROFESSIONS = [
    { name: 'Electricista', icon: Zap, count: 'Matriculados e independientes' },
    { name: 'Plomero / Gasista', icon: Droplet, count: 'Urgencias e instalaciones' },
    { name: 'Técnico Aire & Split', icon: Cpu, count: 'Mantenimiento e instalación' },
    { name: 'Albañil & Construcción', icon: Hammer, count: 'Refacciones y obras' },
    { name: 'Pintor', icon: Sparkles, count: 'Interior y exterior' },
    { name: 'Cerrajería', icon: Lock, count: 'Aperturas y cambios de combinación' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[26rem] bg-blue-600/15 rounded-full blur-[128px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -right-32 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/25 border border-white/20">
              C
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white leading-none">CONEXA</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  BETA
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
                Red privada de servicios locales • {selectedCity}
              </span>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleProCta}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors hidden md:inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-900"
            >
              <Wrench size={14} className="text-emerald-400" />
              Ofrecer servicios
            </button>

            <button
              onClick={handleLoginClick}
              className="text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Iniciar Sesión
            </button>

            <button
              onClick={() => handleHeroCta()}
              className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Search size={13} />
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION (Mobile-First Viewport) */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Hero Left Column (Copy & CTAs) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Value Badges */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <MapPin size={12} className="text-emerald-400" />
                {selectedCity} y alrededores
              </span>
              <span className="text-[11px] font-bold bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-blue-400" />
                Privacidad de datos por diseño
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                ¿Necesitás un <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">profesional?</span>
              </h1>
              <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Encontrá profesionales de tu zona de forma rápida y privada.
              </p>
            </div>

            {/* Microcopy Friction Reducer */}
            <div className="flex items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm font-semibold text-slate-400">
              <span className="flex items-center gap-1 text-slate-300"><Check size={14} className="text-emerald-400" /> Encontrá</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300"><Check size={14} className="text-emerald-400" /> Conectá</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300"><Check size={14} className="text-emerald-400" /> Resolvé</span>
            </div>

            {/* Quick Interactive Search Bar in Hero */}
            <div className="bg-slate-900/90 border border-slate-700/80 p-2 rounded-2xl shadow-xl max-w-xl mx-auto lg:mx-0 backdrop-blur-md">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleHeroCta(quickSearchInput); }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={quickSearchInput}
                    onChange={(e) => setQuickSearchInput(e.target.value)}
                    placeholder="Ej: electricista, plomero, aire acondicionado..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>BUSCAR EN CONEXA</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

            {/* Secondary CTA & Fast Shortcuts */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleProCta}
                className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>¿Sos electricista, plomero o técnico?</span>
                <span className="text-emerald-400 underline font-bold">Quiero ofrecer mis servicios →</span>
              </button>
            </div>

            {/* Popular Shortcut Pills */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Búsquedas frecuentes en {selectedCity}:
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                {['Electricista', 'Plomero', 'Aire Acondicionado', 'Albañil', 'Gasista'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleQuickProfessionClick(p)}
                    className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 transition-all cursor-pointer shadow-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Hero Right Column (App Native Realistic Mockup Preview) */}
          <div className="lg:col-span-5 relative">
            
            {/* Decorative Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            
            {/* Phone/Frame Wrapper */}
            <div className="relative bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              
              {/* App Mockup Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-extrabold text-white">CONEXA LIVE</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Ejemplo de interfaz • Datos de demostración
                </span>
              </div>

              {/* Sample Pro Card 1 */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=120"
                      alt="Ejemplo ilustrativo de perfil profesional"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-white text-xs">Carlos M.</h4>
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.2 rounded-md border border-slate-700">
                          Ejemplo de perfil
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Electricista • Ilustrativo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold justify-end">
                      <Star size={12} fill="currentColor" /> 4.9
                    </div>
                    <span className="text-[9px] text-slate-500 block">Dato de muestra</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-900">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Disponible
                  </span>
                  <span className="text-slate-500 text-[10px]">Demostración de radio</span>
                </div>
              </div>

              {/* Sample Pro Card 2 */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                      alt="Ejemplo ilustrativo de perfil profesional"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-white text-xs">Marcelo J.</h4>
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.2 rounded-md border border-slate-700">
                          Ejemplo de perfil
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Plomería & Gas • Ilustrativo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold justify-end">
                      <Star size={12} fill="currentColor" /> 4.8
                    </div>
                    <span className="text-[9px] text-slate-500 block">Dato de muestra</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-900">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Disponible
                  </span>
                  <span className="text-slate-500 text-[10px]">Demostración de radio</span>
                </div>
              </div>

              {/* Sample Privacy Guarantee in Mockup */}
              <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-2xl flex items-center gap-3 text-xs text-blue-200">
                <Shield size={18} className="text-blue-400 shrink-0" />
                <p className="text-[11px] leading-snug">
                  <strong className="text-white">Privacidad activa:</strong> Tu teléfono y ubicación exacta están protegidos hasta que decidas contactar.
                </p>
              </div>

              {/* Mockup Action Button */}
              <button
                onClick={() => handleHeroCta()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Ver profesionales disponibles cerca</span>
                <ChevronRight size={14} />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* 2. PROBLEMA: "Encontrar a alguien confiable no debería ser complicado" */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
              El problema actual
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Encontrar a alguien confiable no debería ser complicado.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Buscar servicios en redes sociales o grupos informales suele generar pérdida de tiempo y riesgos innecesarios.
            </p>
          </div>

          {/* 3 Core Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Problem 1 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">No sabés a quién llamar</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Preguntar recomendaciones en grupos lleva horas, y casi nunca sabés si la persona realmente tiene experiencia o disponibilidad para atenderte.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Perdés tiempo buscando</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Llamar a números desactualizados, esperar mensajes que nunca se responden o coordinar visitas sin tener una estimación clara del trabajo.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                <EyeOff size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Exposición innecesaria de datos</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tener que publicar tu número de teléfono personal y la dirección de tu casa en foros abiertos para que cualquiera pueda contactarte.
              </p>
            </div>

          </div>

          {/* Solution Intro Callout */}
          <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-800/40 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
              <Sparkles size={14} /> La solución CONEXA
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Una plataforma limpia, directa y con foco en privacidad.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              En CONEXA conectás de forma transparente con profesionales de tu zona, chateás en un entorno protegido y decidís con total control qué datos compartir.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleHeroCta()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Probar CONEXA ahora</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CÓMO FUNCIONA (3 Pasos extremadamente visuales) */}
      <section ref={howItWorksRef} className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Paso a paso
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            ¿Cómo funciona CONEXA?
          </h2>
          <p className="text-sm text-slate-400">
            Tres pasos simples para resolver lo que necesitás sin vueltas.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-blue-500/60 font-mono">01</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search size={20} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Decí qué necesitás</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Seleccioná el oficio (electricista, plomero, técnico, etc.) o publicá una solicitud breve indicando tu zona aproximada.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-indigo-500/60 font-mono">02</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Encontrá profesionales de tu zona</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Revisá perfiles cercanos, especialidades, disponibilidad actual y valoraciones de trabajos anteriores.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-emerald-500/60 font-mono">03</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Contactá y resolvé</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Iniciá un chat protegido, coordiná presupuestos y compartí tus datos de contacto únicamente cuando vos lo decidas.
            </p>
          </div>

        </div>
      </section>

      {/* 4. BENEFICIOS */}
      <section className="py-16 bg-slate-900/50 border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Ventajas claras
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Diseñado para resolver con tranquilidad.
            </h2>
            <p className="text-sm text-slate-400">
              Cada funcionalidad está pensada para darte una experiencia ágil, confiable y segura.
            </p>
          </div>

          {/* Benefit Cards Grid (6 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Benefit 1 */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Profesionales de tu zona</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cercanía real para coordinar visitas más rápido y evitar demoras innecesarias por traslados largos.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Búsqueda rápida</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filtros por oficio, rubro y radio de distancia para encontrar en segundos justo lo que tu casa o comercio necesita.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Privacidad resguardada</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tu número telefónico y domicilio exacto permanecen privados hasta que vos autorices compartirlos en el chat.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Contacto directo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conversá directamente con quien realizará el trabajo, hacé consultas y recibí presupuestos formales.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Award size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Reputación y perfil</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conocé la trayectoria, especialidades y valoraciones de clientes antes de aceptar un presupuesto.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Simple desde el celular</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accedé al instante desde cualquier navegador móvil. Sin descargas pesadas obligatorias.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CONEXA RADAR / INTELIGENCIA TECNOLÓGICA */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse text-blue-400" />
              Tecnología CONEXA
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Conexión ágil en {selectedCity}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              CONEXA trabaja para ayudarte a encontrar la conexión adecuada.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              La plataforma ayuda a identificar oportunidades y conectar la demanda de servicios con profesionales disponibles en el momento y lugar indicados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white block font-bold mb-0.5">Emparejamiento de proximidad:</strong>
                Prioriza profesionales en tu zona para reducir traslados y tiempos de espera.
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white block font-bold mb-0.5">Disponibilidad en tiempo real:</strong>
                Filtra profesionales que están activos y listos para presupuestar tu trabajo.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. PRIVACIDAD: "Tu privacidad primero" */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Shield size={32} />
            </div>
            <div className="space-y-2 flex-1">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">Compromiso de diseño</span>
              <h2 className="text-2xl font-black text-white">Tu privacidad primero.</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                CONEXA está diseñada para reducir la exposición innecesaria de datos personales. A diferencia de las redes sociales públicas, acá conversás por chat interno y tus datos sensibles quedan protegidos hasta que tengas plena confianza.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. SECCIÓN PARA PROFESIONALES */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Wrench size={13} /> Para electricistas, plomeros, técnicos y contratistas
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ¿Sos profesional?
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Mostrá lo que hacés y conectá con personas que necesitan tus servicios.
              </p>
            </div>

            <button
              onClick={handleProCta}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              QUIERO OFRECER MIS SERVICIOS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-emerald-900/40 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Perfil profesional destacado
              </span>
              <p className="text-slate-400">Mostrá tu rubro, zona de cobertura y fotos de tus trabajos.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Solicitudes directas
              </span>
              <p className="text-slate-400">Recibí pedidos de presupuesto de personas cercanas a vos.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Sin intermediarios molestos
              </span>
              <p className="text-slate-400">Chateá directo, acordá presupuestos y cobrá tus servicios.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 8. DEMOSTRACIÓN VISUAL (MOCKUPS INTERACTIVOS REALES DE CONEXA) */}
      <section ref={demoRef} className="py-16 sm:py-24 bg-slate-900/60 border-y border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Interfaz nativa
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Así se ve CONEXA en tu celular.
            </h2>
            <p className="text-sm text-slate-400">
              Una plataforma limpia, ágil y pensada para resolver en pocos toques.
            </p>
          </div>

          {/* Interactive Mockup Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'search', label: '1. Búsqueda y Oficios', icon: Search },
              { id: 'list', label: '2. Listado de Profesionales', icon: Users },
              { id: 'profile', label: '3. Perfil Detallado', icon: Award },
              { id: 'chat', label: '4. Chat y Presupuesto', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeMockupTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveMockupTab(tab.id as any);
                    trackEvent('app_demo_tab_change', { tab: tab.id });
                  }}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Screen Mockup Container */}
          <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
            
            {/* Screen 1: Búsqueda */}
            {activeMockupTab === 'search' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300">Explorar rubros en {selectedCity}</span>
                  <span className="text-[10px] text-blue-400 font-extrabold bg-blue-500/10 px-2 py-0.5 rounded-full">Filtro activo</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {POPULAR_PROFESSIONS.map(item => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={item.name}
                        onClick={() => handleQuickProfessionClick(item.name)}
                        className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 p-3 rounded-2xl cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                          <Icon size={16} />
                        </div>
                        <h4 className="font-bold text-white text-xs leading-tight">{item.name}</h4>
                        <p className="text-[10px] text-slate-400">{item.count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Screen 2: Listado de Profesionales */}
            {activeMockupTab === 'list' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300">Demostración de listado</span>
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    Datos de demostración
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=120" 
                      alt="Ejemplo ilustrativo de perfil profesional"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white">Carlos M.</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 rounded border border-slate-700">
                          Perfil ilustrativo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Electricidad • Especialidad de ejemplo</p>
                      <span className="text-[10px] text-slate-500">● Disponibilidad de muestra</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 text-xs font-bold">★ 4.9</span>
                    <p className="text-[9px] text-slate-500">Muestra</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" 
                      alt="Ejemplo ilustrativo de perfil profesional"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white">Marcelo J.</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 rounded border border-slate-700">
                          Perfil ilustrativo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Plomería • Especialidad de ejemplo</p>
                      <span className="text-[10px] text-slate-500">● Disponibilidad de muestra</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 text-xs font-bold">★ 4.8</span>
                    <p className="text-[9px] text-slate-500">Muestra</p>
                  </div>
                </div>
              </div>
            )}

            {/* Screen 3: Perfil Profesional */}
            {activeMockupTab === 'profile' && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300">Ficha de perfil</span>
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    Ejemplo de perfil
                  </span>
                </div>

                <div className="flex items-center gap-3 pb-2">
                  <img 
                    src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=120" 
                    alt="Ejemplo ilustrativo de perfil profesional"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Carlos M. (Perfil ilustrativo)</h4>
                    <p className="text-slate-400">Electricista con matrícula habilitante</p>
                    <span className="text-slate-400 text-[11px]">Calificaciones y valoraciones de clientes</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Zona de trabajo:</span>
                    <strong className="text-white">Santiago del Estero y La Banda</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Especialidad:</span>
                    <strong className="text-white">Tableros, cortocircuitos, cableados</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleHeroCta()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <MessageSquare size={13} />
                  <span>Contactar en privado</span>
                </button>
              </div>
            )}

            {/* Screen 4: Chat y Presupuesto */}
            {activeMockupTab === 'chat' && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">Chat de demostración</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">🔒 Teléfono oculto</span>
                </div>

                <div className="space-y-2 py-1">
                  <div className="bg-slate-900 p-2.5 rounded-2xl rounded-tl-xs max-w-xs text-[11px] text-slate-300">
                    Hola! Necesito cambiar el disyuntor principal de mi casa porque salta continuamente.
                  </div>
                  <div className="bg-blue-600 text-white p-2.5 rounded-2xl rounded-tr-xs max-w-xs ml-auto text-[11px]">
                    Buenas tardes! Puedo pasar hoy a las 17:30 hs a revisarlo y dejarte el presupuesto.
                  </div>
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-2.5 rounded-2xl text-[11px] space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Presupuesto Estimado
                    </span>
                    <p className="text-slate-300">Revisión de térmica + recambio de disyuntor.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 9. CONFIANZA (Sin métricas ni números inventados) */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Garantías del sistema
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pilares de confianza de CONEXA.
          </h2>
          <p className="text-sm text-slate-400">
            Principios que rigen nuestra plataforma para proteger tanto a usuarios particulares como a profesionales.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <ShieldCheck size={24} className="text-blue-400" />
            <h3 className="font-bold text-white text-sm">Verificación de identidad</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validación voluntaria de identidad y acreditación de oficio para mayor transparencia.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <Star size={24} className="text-amber-400" />
            <h3 className="font-bold text-white text-sm">Opiniones de clientes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reseñas y calificaciones transparentes para que tomes decisiones con respaldo.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <Lock size={24} className="text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Protección de datos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tus datos de contacto privados no se publican abiertamente en internet.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <UserCheck size={24} className="text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Moderación y reportes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Herramientas de reporte comunitario y revisión activa para mantener la red sana.
            </p>
          </div>

        </div>
      </section>

      {/* 10. CTA FINAL DE ALTA CONVERSIÓN */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl space-y-6 relative overflow-hidden">
          
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full inline-block backdrop-blur-md">
              Empezá hoy en {selectedCity}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Encontrá a quien necesitás.
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
              Entrá a CONEXA y empezá a buscar profesionales de tu zona de forma rápida y privada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFinalCta}
              className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Search size={18} className="text-blue-600" />
              <span>BUSCAR EN CONEXA</span>
            </button>
            <button
              onClick={handleProCta}
              className="w-full sm:w-auto bg-blue-900/60 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm px-6 py-4 rounded-2xl border border-white/20 transition-all cursor-pointer"
            >
              Quiero ofrecer mis servicios
            </button>
          </div>

          <div className="text-[11px] text-blue-200/80 pt-2 flex items-center justify-center gap-4">
            <span>✓ 100% Gratuito para buscar</span>
            <span>✓ Sin compromiso inicial</span>
            <span>✓ Datos protegidos</span>
          </div>

        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">
                C
              </div>
              <span className="font-black text-base text-white tracking-tight">CONEXA</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Red privada de conexión de personas, profesionales y servicios locales en Argentina.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Para Usuarios</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li><button onClick={() => handleHeroCta()} className="hover:text-white cursor-pointer">Buscar profesionales</button></li>
              <li><button onClick={() => handleQuickProfessionClick('Electricista')} className="hover:text-white cursor-pointer">Electricistas</button></li>
              <li><button onClick={() => handleQuickProfessionClick('Plomero')} className="hover:text-white cursor-pointer">Plomeros y Gasistas</button></li>
              <li><button onClick={() => handleQuickProfessionClick('Técnico Aire')} className="hover:text-white cursor-pointer">Refrigeración</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Para Profesionales</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li><button onClick={handleProCta} className="hover:text-white cursor-pointer">Ofrecer servicios</button></li>
              <li><button onClick={handleProCta} className="hover:text-white cursor-pointer">Crear perfil profesional</button></li>
              <li><button onClick={handleLoginClick} className="hover:text-white cursor-pointer">Acceso a profesionales</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Privacidad y Términos</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li><span className="text-slate-300">Política de Privacidad de Datos</span></li>
              <li><span className="text-slate-300">Términos de Uso del Servicio</span></li>
              <li><span className="text-slate-300">Contacto: Santiago del Estero, Argentina</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 CONEXA RMX. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-400" /> Plataforma Segura</span>
            <span>•</span>
            <span>BETA 1.0</span>
          </div>
        </div>
      </footer>

      {/* 12. STICKY MOBILE CTA BAR (Appears on scroll for mobile) */}
      {showStickyCta && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl animate-fade-in flex items-center gap-2">
          <button
            onClick={() => handleHeroCta()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Search size={14} />
            <span>BUSCAR EN CONEXA</span>
          </button>
          <button
            onClick={handleProCta}
            className="bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs py-3.5 px-3 rounded-xl hover:text-white cursor-pointer shrink-0"
          >
            Soy Pro
          </button>
        </div>
      )}

      {/* AUTH / REGISTRATION POPUP MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-md my-8">
            <AuthPortal
              initialIsLogin={authInitialIsLogin}
              initialRole={authInitialRole}
              initialProfession={authInitialProfession}
              onClose={() => setIsAuthOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
